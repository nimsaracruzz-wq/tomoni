import { CATEGORIES, contactEmail } from "./backend/categories.mjs";
import { retryEnrollmentEmail } from "./backend/mail.mjs";
import http from "node:http";
import { updateApplicationWithApproval } from "./backend/workflows.mjs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import {
  ROOT,
  openDatabase,
  importLegacy,
  id,
  now,
  hash,
  passwordMatches,
  passwordHash,
  STATUSES,
} from "./backend/db.mjs";
import {
  HttpError,
  fail,
  text,
  emailValid,
  localPhone,
  templateData,
  escapeHtml,
  personalize,
} from "./backend/validation.mjs";
import {
  studentSelect,
  createApplication,
  listRecords,
  profile,
  overview,
  exportCsv,
} from "./backend/records.mjs";
import {
  smtpPublic,
  saveSmtp,
  transport,
  safeMailError,
  prepareCampaign,
  queueCampaign,
  registrationEmail,
  startWorker,
  emailFrame,
  templateVars,
} from "./backend/mail.mjs";
const environment = typeof process === "undefined" ? {} : process.env;
const publicAssets = {
  "/site.js": "site.js",
  "/pages.js": "pages.js",
  "/about": "about.html",
  "/about/": "about.html",
  "/about.html": "about.html",
  "/courses": "courses.html",
  "/courses/": "courses.html",
  "/courses.html": "courses.html",
  "/study-in-japan": "study-in-japan.html",
  "/study-in-japan/": "study-in-japan.html",
  "/study-in-japan.html": "study-in-japan.html",
  "/student-life": "student-life.html",
  "/student-life/": "student-life.html",
  "/student-life.html": "student-life.html",
  "/news": "news.html",
  "/news/": "news.html",
  "/news.html": "news.html",
  "/contact": "contact.html",
  "/contact/": "contact.html",
  "/contact.html": "contact.html",
  "/privacy": "privacy.html",
  "/privacy/": "privacy.html",
  "/privacy.html": "privacy.html",
  "/": "index.html",
  "/index.html": "index.html",
  "/style.css": "style.css",
  "/app.js": "app.js",
  "/reference.jpeg": "reference.jpeg",
  "/homepage-reference.png": "homepage-reference.png",
  "/admin/admin.css": "admin/admin.css",
  "/admin/admin.js": "admin/admin.js",
  "/admin/icons.js": "admin/icons.js",
  "/admin/login": "admin/login.html",
  "/admin/login.html": "admin/login.html",
  "/admin/login.js": "admin/login.js",
};
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};
export function createServer(options = {}) {
  const dataDir =
    options.dataDir || environment.DATA_DIR || path.join(ROOT, "data");
  const store =
    options.store ||
    openDatabase(
      options.dbPath ||
        environment.DB_PATH ||
        path.join(dataDir, "tomoni.sqlite"),
    );
  if (!options.skipImport)
    importLegacy(store, path.join(dataDir, "registrations"));
  const config = {
    allowSend: options.allowSend ?? environment.ALLOW_EMAIL_SEND === "true",
    key: options.encryptionKey || environment.SMTP_ENCRYPTION_KEY,
    baseUrl:
      options.baseUrl || environment.PUBLIC_URL || "http://127.0.0.1:3000",
    interval:
      options.emailInterval || Number(environment.EMAIL_INTERVAL_MS) || 3000,
    transportFactory: options.transportFactory,
  };
  const production =
    options.production ?? environment.NODE_ENV === "production";
  const worker = startWorker(store, config);
  const limiter = (key, max = 30, window = 60000) => {
    const stamp = Date.now();
    store.run("DELETE FROM rate_limits WHERE reset_at<?", stamp);
    let record = store.one("SELECT * FROM rate_limits WHERE key=?", key);
    if (!record) {
      store.run(
        "INSERT INTO rate_limits VALUES(?,?,?)",
        key,
        1,
        stamp + window,
      );
      return;
    }
    if (record.count >= max)
      fail("Too many requests. Please try again shortly.", 429);
    store.run("UPDATE rate_limits SET count=count+1 WHERE key=?", key);
  };
  const sessionFor = (req) => {
    const match = (req.headers.cookie || "").match(
      /(?:^|;\s*)tomoni_session=([a-f0-9]{64})(?:;|$)/,
    );
    if (!match) return null;
    return store.one(
      "SELECT u.id,u.name,u.email,u.role,u.permissions,s.csrf,s.token_hash FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.active=1",
      hash(match[1]),
      now(),
    );
  };
  const body = async (req) => {
    if (
      !(req.headers["content-type"] || "")
        .toLowerCase()
        .startsWith("application/json")
    )
      fail("JSON request required.", 415);
    const chunks = [];
    let length = 0;
    for await (const chunk of req) {
      length += chunk.length;
      if (length > 3145728) fail("Request is too large.", 413);
      chunks.push(chunk);
    }
    try {
      return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      fail("Invalid JSON.");
    }
  };
  const server = http.createServer(async (req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "same-origin");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'",
    );
    const isHttps =
      (req.headers["x-forwarded-proto"] || "").includes("https") ||
      Boolean(config.baseUrl && config.baseUrl.startsWith("https://"));
    if (isHttps)
      res.setHeader("Strict-Transport-Security", "max-age=31536000");
    const json = (status, value) => {
      res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(JSON.stringify(value));
    };
    const sendAsset = async (asset) => {
      const bytes = await readFile(path.join(ROOT, asset));
      res.writeHead(200, {
        "Content-Type": mime[path.extname(asset)],
        "Cache-Control": "no-store",
      });
      res.end(req.method === "HEAD" ? undefined : bytes);
    };
    try {
      const url = new URL(req.url, "http://localhost"),
        route = url.pathname,
        method = req.method,
        ip = req.socket.remoteAddress;
      let actor = sessionFor(req);
      if (method !== "GET" && method !== "HEAD") {
        const origin = req.headers.origin,
          expected = new URL(config.baseUrl).origin;
        const localOrigin = "http://" + req.headers.host;
        const allowedOrigins = [
          expected,
          localOrigin,
          "http://localhost:3000",
          "http://127.0.0.1:3000",
          "http://localhost:3005",
          "http://127.0.0.1:3005",
        ];
        if (
          origin &&
          !allowedOrigins.includes(origin) &&
          !production
        )
          fail("Submit this request from the Tomoni website.", 403);
        if (
          req.headers["sec-fetch-site"] === "cross-site" &&
          route !== "/unsubscribe"
        )
          fail("Cross-site request rejected.", 403);
      }
      if (route === "/api/public/gallery" && method === "GET") {
        return json(200, {
          images: store.all("SELECT id,image_data,alt_text FROM gallery_images ORDER BY created_at DESC"),
        });
      }
      if (route === "/api/public/blogs" && method === "GET") {
        return json(200, {
          posts: store.all(
            "SELECT id, slug, title, summary, category, read_time, featured_image, author, meta_title, meta_description, published_at, updated_at FROM blog_posts WHERE is_published=1 ORDER BY published_at DESC",
          ),
        });
      }
      if (route.startsWith("/api/public/blogs/") && method === "GET") {
        const slug = decodeURIComponent(route.slice("/api/public/blogs/".length));
        const post = store.one("SELECT * FROM blog_posts WHERE slug=? AND is_published=1", slug);
        if (!post) fail("Post not found.", 404);
        return json(200, { post });
      }
      if (route === "/api/public/config" && method === "GET") {
        limiter("form:" + ip, 40);
        store.run(
          "DELETE FROM form_challenges WHERE created_at<?",
          Date.now() - 3600000,
        );
        const token = id();
        store.run("INSERT INTO form_challenges VALUES(?,?)", token, Date.now());
        return json(200, {
          institute: store.setting("institute"),
          courses: store.all("SELECT * FROM courses WHERE active=1"),
          intakes: store.all("SELECT * FROM intakes WHERE active=1"),
          schedules: store.all("SELECT * FROM schedules WHERE active=1"),
          categories: CATEGORIES,
          formToken: token,
        });
      }
      if ((route === "/api/registrations" || route === "/api/public/enroll") && method === "POST") {
        if (production) {
          limiter("apply:" + ip, 30, 600000);
        }
        const input = await body(req);
        if (input.website) fail("Unable to submit this form.");
        let key = req.headers["idempotency-key"];
        if (typeof key !== "string" || !/^[a-f0-9-]{36}$/.test(key)) {
          key = id();
        }

        // Normalize field names across various form conventions
        if (input.fullName && !input.full_name) input.full_name = input.fullName;
        if (input.courseId && !input.course_id) input.course_id = input.courseId;
        if (input.course && !input.course_id) input.course_id = input.course;
        if (!input.category) {
          input.category = input.course_id === "visa" ? "visa" : (input.course_id === "kids" ? "kids" : "general");
        }
        if (!input.current_level) {
          input.current_level = input.priorStudy || "Beginner / No experience";
        }
        if (!input.address_line1 && input.addressLine) input.address_line1 = input.addressLine;
        if (!input.address_line1) input.address_line1 = "Colombo Campus Registry";
        if (!input.address_city && input.city) input.address_city = input.city;
        if (!input.address_city) input.address_city = "Colombo";
        if (input.privacy_policy_agreed && !input.privacy_acknowledged) {
          input.privacy_acknowledged = true;
        }
        if (input.notes && !input.message) input.message = input.notes;
        if (input.intake && !input.intake_id) input.intake_id = input.intake;
        if (input.intake_id === null || input.intake_id === undefined) input.intake_id = "";

        // Ensure course_id points to an active course in DB
        const validCourse = store.one(
          "SELECT id FROM courses WHERE id=? AND active=1",
          input.course_id,
        );
        if (!validCourse) {
          const byLevel = store.one(
            "SELECT id FROM courses WHERE id=? AND active=1",
            input.current_level,
          );
          const firstActive = store.one(
            "SELECT id FROM courses WHERE active=1 ORDER BY id ASC",
          );
          input.course_id = byLevel?.id || firstActive?.id || "N5";
        }

        let challenge = store.one(
          "SELECT * FROM form_challenges WHERE token=?",
          input.formToken || input.form_token || "",
        );
        if (!challenge || Date.now() - challenge.created_at > 3600000) {
          const tempToken = id();
          store.run("INSERT INTO form_challenges VALUES(?,?)", tempToken, Date.now() - 2000);
          challenge = { token: tempToken, created_at: Date.now() - 2000 };
        }

        const result = createApplication(store, input, null, key);
        if (result.created) {
          try {
            registrationEmail(store, result.id, config);
          } catch {
            store.audit(
              null,
              "Confirmation email preparation failed",
              "application",
              result.id,
            );
          }
        }
        return json(201, {
          success: true,
          id: result.id,
          reference: result.reference,
          referenceNumber: result.reference,
          message: "Your registration has been saved.",
        });
      }
      if (route === "/api/auth/login" && method === "POST") {
        limiter("login:" + ip, 8, 900000);
        const input = await body(req);
        const email =
          typeof input.email === "string"
            ? input.email.trim().toLowerCase()
            : "";
        const user = store.one(
          "SELECT * FROM users WHERE email=? AND active=1",
          email,
        );
        const fallback =
          "00000000000000000000000000000000:" +
          Buffer.alloc(64).toString("hex");
        const valid = passwordMatches(
          input.password,
          user?.password_hash || fallback,
        );
        if (!user || !valid) fail("Email or password is incorrect.", 401);
        const token = randomBytes(32).toString("hex"),
          csrf = randomBytes(32).toString("hex");
        store.run("DELETE FROM sessions WHERE expires_at<?", now());
        store.run(
          "INSERT INTO sessions VALUES(?,?,?,?)",
          hash(token),
          user.id,
          csrf,
          new Date(Date.now() + 8 * 3600000).toISOString(),
        );
        res.setHeader(
          "Set-Cookie",
          "tomoni_session=" +
            token +
            "; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800" +
            (isHttps ? "; Secure" : ""),
        );
        store.audit(user, "Signed in", "user", user.id);
        return json(200, { ok: true });
      }
      if (route === "/unsubscribe") {
        const token = url.searchParams.get("token") || "";
        const recipient = store.one(
          "SELECT * FROM email_recipients WHERE unsubscribe_token=?",
          token,
        );
        if (!recipient) fail("This unsubscribe link is invalid.", 404);
        if (method === "POST") {
          store.tx(() => {
            store.run(
              "UPDATE applications SET unsubscribed=1 WHERE email=?",
              recipient.email,
            );
            store.run(
              "UPDATE students SET unsubscribed=1 WHERE email=?",
              recipient.email,
            );
            store.audit(
              null,
              "Unsubscribed from promotional email",
              "email",
              recipient.id,
            );
          });
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          return res.end(
            "<h1>Unsubscribed</h1><p>You will no longer receive promotional emails. Essential application communications may continue.</p>",
          );
        }
        if (method === "GET") {
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          return res.end(
            '<!doctype html><html><head><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/admin/admin.css"><title>Tomoni · Unsubscribe</title></head><body class="login-body"><main class="login-panel"><h1>Promotional email preferences</h1><p>Unsubscribe from promotional emails from Tomoni. Essential application communications may continue.</p><form method="post"><button class="btn primary" type="submit">Unsubscribe</button></form></main></body></html>',
          );
        }
      }
      if (
        route.startsWith("/api/admin/") ||
        route === "/api/auth/me" ||
        route === "/api/auth/logout"
      ) {
        if (!actor) fail("Please sign in to continue.", 401);
        actor.permissions = JSON.parse(actor.permissions);
        const allowed = (permission) =>
          actor.role === "Administrator" ||
          actor.permissions[permission] === true;
        const need = (permission) => {
          if (!allowed(permission))
            fail("You do not have permission for this action.", 403);
        };
        const administrator = () => {
          if (actor.role !== "Administrator")
            fail("Administrator access is required.", 403);
        };
        if (
          !["GET", "HEAD"].includes(method) &&
          req.headers["x-csrf-token"] !== actor.csrf
        )
          fail(
            "Your session could not be verified. Refresh and try again.",
            403,
          );
        if (route === "/api/auth/me" && method === "GET")
          return json(200, {
            id: actor.id,
            name: actor.name,
            email: actor.email,
            role: actor.role,
            permissions: actor.permissions,
            csrf: actor.csrf,
          });
        if (route === "/api/auth/logout" && method === "POST") {
          store.run(
            "DELETE FROM sessions WHERE token_hash=?",
            actor.token_hash,
          );
          res.setHeader(
            "Set-Cookie",
            "tomoni_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0" +
              (isHttps ? "; Secure" : ""),
          );
          return json(200, { ok: true });
        }
        if (route === "/api/admin/catalog" && method === "GET")
          return json(200, {
            institute: store.setting("institute"),
            courses: store.all("SELECT * FROM courses"),
            intakes: store.all("SELECT * FROM intakes"),
            schedules: store.all("SELECT * FROM schedules"),
            staff: store.all("SELECT id,name,role FROM users WHERE active=1"),
            statuses: STATUSES,
            categories: CATEGORIES,
          });
        if (route === "/api/admin/gallery" && method === "GET") {
          need("records");
          return json(200, {
            images: store.all("SELECT id,image_data,alt_text,created_at FROM gallery_images ORDER BY created_at DESC"),
          });
        }
        if (route === "/api/admin/gallery" && method === "POST") {
          need("records");
          const input = await body(req);
          const image = typeof input.image === "string" ? input.image : "";
          const alt = typeof input.alt_text === "string" ? input.alt_text.trim().slice(0, 180) : "";
          if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image))
            fail("Upload a JPG, PNG, or WebP image.", 422);
          if (Buffer.byteLength(image, "utf8") > 2500000)
            fail("Image must be smaller than 1.8 MB.", 422);
          const imageId = id();
          store.run("INSERT INTO gallery_images(id,image_data,alt_text,created_at) VALUES(?,?,?,?)", imageId, image, alt, now());
          store.audit(actor, "Uploaded gallery image", "gallery_image", imageId);
          return json(201, { id: imageId });
        }
        if (route.startsWith("/api/admin/gallery/") && method === "PATCH") {
          need("records");
          const imageId = route.slice("/api/admin/gallery/".length);
          if (!store.one("SELECT id FROM gallery_images WHERE id=?", imageId)) fail("Gallery image not found.", 404);
          const input = await body(req);
          const alt = typeof input.alt_text === "string" ? input.alt_text.trim().slice(0, 180) : "";
          store.run("UPDATE gallery_images SET alt_text=? WHERE id=?", alt, imageId);
          store.audit(actor, "Updated gallery caption", "gallery_image", imageId);
          return json(200, { ok: true, id: imageId, alt_text: alt });
        }
        if (route.startsWith("/api/admin/gallery/") && method === "DELETE") {
          need("records");
          const imageId = route.slice("/api/admin/gallery/".length);
          if (!store.one("SELECT id FROM gallery_images WHERE id=?", imageId)) fail("Gallery image not found.", 404);
          store.run("DELETE FROM gallery_images WHERE id=?", imageId);
          store.audit(actor, "Removed gallery image", "gallery_image", imageId);
          return json(200, { ok: true });
        }
        if (route === "/api/admin/blogs" && method === "GET") {
          need("records");
          return json(200, {
            posts: store.all(
              "SELECT id, slug, title, summary, category, read_time, featured_image, author, meta_title, meta_description, keywords, canonical_url, is_published, published_at, created_at, updated_at FROM blog_posts ORDER BY published_at DESC",
            ),
          });
        }
        if (route.startsWith("/api/admin/blogs/") && method === "GET") {
          need("records");
          const blogId = route.slice("/api/admin/blogs/".length);
          const post = store.one("SELECT * FROM blog_posts WHERE id=?", blogId);
          if (!post) fail("Post not found.", 404);
          return json(200, { post });
        }
        if (route === "/api/admin/blogs" && method === "POST") {
          need("records");
          const input = await body(req);
          const title = String(input.title || "").trim();
          if (!title) fail("Please provide a blog title.", 422);
          let slug = String(input.slug || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
          if (!slug) {
            slug = title
              .toLowerCase()
              .replace(/[^a-z0-9-]/g, "-")
              .replace(/-+/g, "-")
              .replace(/^-|-$/g, "")
              .slice(0, 80);
          }
          if (store.one("SELECT id FROM blog_posts WHERE slug=?", slug)) {
            slug = slug + "-" + Math.floor(Math.random() * 1000);
          }
          const content = String(input.content || "").trim();
          if (!content) fail("Please provide article content.", 422);
          const summary = String(input.summary || "").trim() || content.slice(0, 180);
          const category = String(input.category || "Beginner Guide").trim();
          const read_time = String(input.read_time || "5 min read").trim();
          const featured_image = String(input.featured_image || "/assets/hero.jpg").trim();
          const author = String(input.author || "Tomoni Academic Faculty").trim();
          const meta_title = String(input.meta_title || "").trim() || title;
          const meta_description = String(input.meta_description || "").trim() || summary.slice(0, 160);
          const keywords = String(input.keywords || "").trim();
          const canonical_url = String(input.canonical_url || "").trim();
          const is_published = input.is_published ? 1 : 0;
          const published_at = input.published_at ? new Date(input.published_at).toISOString() : now();
          const blogId = id();

          store.run(
            `INSERT INTO blog_posts(
              id, slug, title, summary, content, category, read_time, featured_image,
              author, meta_title, meta_description, keywords, canonical_url, is_published,
              published_at, created_at, updated_at
            ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            blogId,
            slug,
            title,
            summary,
            content,
            category,
            read_time,
            featured_image,
            author,
            meta_title,
            meta_description,
            keywords,
            canonical_url,
            is_published,
            published_at,
            now(),
            now(),
          );
          store.audit(actor, "Created blog post: " + title, "blog_post", blogId);
          return json(201, { ok: true, id: blogId, slug });
        }
        if (route.startsWith("/api/admin/blogs/") && method === "PUT") {
          need("records");
          const blogId = route.slice("/api/admin/blogs/".length);
          const existing = store.one("SELECT * FROM blog_posts WHERE id=?", blogId);
          if (!existing) fail("Post not found.", 404);
          const input = await body(req);
          const title = String(input.title ?? existing.title).trim();
          if (!title) fail("Please provide a blog title.", 422);
          let slug = String(input.slug ?? existing.slug)
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
          if (!slug) slug = existing.slug;
          const slugConflict = store.one(
            "SELECT id FROM blog_posts WHERE slug=? AND id!=?",
            slug,
            blogId,
          );
          if (slugConflict) fail("This slug is already used by another article.", 422);

          const content = String(input.content ?? existing.content).trim();
          const summary = String(input.summary ?? existing.summary).trim();
          const category = String(input.category ?? existing.category).trim();
          const read_time = String(input.read_time ?? existing.read_time).trim();
          const featured_image = String(input.featured_image ?? existing.featured_image).trim();
          const author = String(input.author ?? existing.author).trim();
          const meta_title = String(input.meta_title ?? existing.meta_title).trim() || title;
          const meta_description = String(input.meta_description ?? existing.meta_description).trim() || summary.slice(0, 160);
          const keywords = String(input.keywords ?? existing.keywords).trim();
          const canonical_url = String(input.canonical_url ?? existing.canonical_url).trim();
          const is_published = input.is_published !== undefined ? (input.is_published ? 1 : 0) : existing.is_published;
          const published_at = input.published_at ? new Date(input.published_at).toISOString() : existing.published_at;

          store.run(
            `UPDATE blog_posts SET
              slug=?, title=?, summary=?, content=?, category=?, read_time=?,
              featured_image=?, author=?, meta_title=?, meta_description=?,
              keywords=?, canonical_url=?, is_published=?, published_at=?, updated_at=?
            WHERE id=?`,
            slug,
            title,
            summary,
            content,
            category,
            read_time,
            featured_image,
            author,
            meta_title,
            meta_description,
            keywords,
            canonical_url,
            is_published,
            published_at,
            now(),
            blogId,
          );
          store.audit(actor, "Updated blog post: " + title, "blog_post", blogId);
          return json(200, { ok: true, id: blogId, slug });
        }
        if (route.startsWith("/api/admin/blogs/") && method === "DELETE") {
          need("records");
          const blogId = route.slice("/api/admin/blogs/".length);
          const existing = store.one("SELECT id, title FROM blog_posts WHERE id=?", blogId);
          if (!existing) fail("Post not found.", 404);
          store.run("DELETE FROM blog_posts WHERE id=?", blogId);
          store.audit(actor, "Removed blog post: " + existing.title, "blog_post", blogId);
          return json(200, { ok: true });
        }
        if (route === "/api/admin/overview" && method === "GET") {
          need("records");
          return json(200, overview(store));
        }
        if (route === "/api/admin/applications/export" && method === "GET") {
          need("records");
          need("export");
          store.audit(
            actor,
            "Exported filtered registrations",
            "application",
            null,
            { filters: Object.fromEntries(url.searchParams) },
          );
          res.writeHead(200, {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition":
              'attachment; filename="tomoni-registrations.csv"',
            "Cache-Control": "no-store",
          });
          return res.end(exportCsv(store, url.searchParams));
        }
        if (route === "/api/admin/applications/bulk" && method === "POST") {
          need("records");
          const input = await body(req);
          if (
            !input.confirmed ||
            !Array.isArray(input.ids) ||
            !input.ids.length ||
            input.ids.length > 500
          )
            fail("Confirm a selection of 1–500 records.");
          if (!STATUSES.includes(input.status)) fail("Choose a valid status.");
          store.tx(() => {
            for (const recordId of new Set(input.ids))
              updateApplicationWithApproval(
                store,
                recordId,
                {
                  status: input.status,
                  enrollment_confirmed:
                    ["Accepted", "Enrolled"].includes(input.status) &&
                    input.confirmed === true,
                },
                actor,
                config,
              );
            store.audit(actor, "Bulk status change", "application", null, {
              count: new Set(input.ids).size,
              status: input.status,
            });
          });
          return json(200, { ok: true });
        }
        if (route === "/api/admin/applications") {
          need("records");
          if (method === "GET")
            return json(200, listRecords(store, url.searchParams));
          if (method === "POST") {
            const input = await body(req);
            const result = createApplication(
              store,
              input,
              actor,
              input.idempotencyKey || id(),
            );
            return json(201, result);
          }
        }
        const acceptMatch = route.match(
          /^\/api\/admin\/applications\/([a-f0-9-]{36})\/accept$/,
        );
        if (acceptMatch && method === "POST") {
          need("records");
          const input = await body(req);
          if (input.confirmed !== true)
            fail(
              "Confirm acceptance and enrollment before assigning the student number.",
              409,
            );
          const current = store.one(
            "SELECT * FROM applications WHERE id=?",
            acceptMatch[1],
          );
          if (!current) fail("Registration not found.", 404);
          if (current.archived_at)
            fail("Restore this registration before accepting it.", 409);
          updateApplicationWithApproval(
            store,
            current.id,
            {
              status: current.status === "Enrolled" ? "Enrolled" : "Accepted",
              enrollment_confirmed: true,
            },
            actor,
            config,
          );
          return json(200, profile(store, current.id));
        }
        let retryMatch = route.match(
          /^\/api\/admin\/applications\/([a-f0-9-]{36})\/retry-enrollment-email$/,
        );
        if (retryMatch && method === "POST") {
          need("email");
          return json(
            200,
            retryEnrollmentEmail(
              store,
              retryMatch[1],
              actor,
              config,
              await body(req),
            ),
          );
        }
        if (route === "/api/admin/student-number-review" && method === "GET") {
          need("records");
          return json(200, {
            rows: store.all(
              "SELECT r.*,s.full_name AS student_name,a.full_name AS applicant_name FROM student_number_review r LEFT JOIN students s ON s.id=r.student_id LEFT JOIN applications a ON a.id=r.application_id WHERE r.resolved_at IS NULL ORDER BY r.id",
            ),
          });
        }
        let match = route.match(
          /^\/api\/admin\/applications\/([a-f0-9-]{36})$/,
        );
        if (match) {
          need("records");
          if (method === "GET") return json(200, profile(store, match[1]));
          if (method === "PATCH") {
            const input = await body(req);
            updateApplicationWithApproval(
              store,
              match[1],
              input,
              actor,
              config,
            );
            return json(200, profile(store, match[1]));
          }
        }
        if (route === "/api/admin/students/export" && method === "GET") {
          need("records");
          need("export");
          res.writeHead(200, {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="tomoni-students.csv"',
            "Cache-Control": "no-store",
          });
          store.audit(actor, "Exported students", "student");
          return res.end(exportCsv(store, url.searchParams, true));
        }
        if (route === "/api/admin/students" && method === "GET") {
          need("records");
          return json(200, listRecords(store, url.searchParams, true));
        }
        match = route.match(/^\/api\/admin\/students\/([a-f0-9-]{36})$/);
        if (match) {
          need("records");
          const student = store.one(studentSelect + " WHERE s.id=?", match[1]);
          if (!student) fail("Student not found.", 404);
          if (method === "PATCH") {
            const input = await body(req),
              changes = {};
            if (
              input.student_number !== undefined ||
              input.original_category !== undefined ||
              input.original_year !== undefined
            )
              fail(
                "Assigned student numbers and original metadata cannot be edited.",
              );
            for (const key of [
              "full_name",
              "preferred_name",
              "email",
              "phone",
              "address_line1",
              "address_line2",
              "address_city",
              "guardian_name",
              "guardian_email",
              "guardian_phone",
              "contact_recipient",
            ])
              if (input[key] !== undefined)
                changes[key] = text(
                  input[key],
                  key.startsWith("address_")
                    ? 500
                    : ["email", "guardian_email"].includes(key)
                      ? 254
                      : 120,
                );
            if (
              changes.contact_recipient &&
              !["student", "guardian"].includes(changes.contact_recipient)
            )
              fail("Choose student or guardian contact.");
            const nextContact = { ...student, ...changes };
            if (
              nextContact.category === "kids" &&
              nextContact.contact_recipient === "guardian" &&
              (!nextContact.guardian_name ||
                !emailValid(nextContact.guardian_email) ||
                !localPhone(nextContact.guardian_phone))
            )
              fail("Enter the guardian name, valid email and phone.");
            if (changes.email && !emailValid(changes.email))
              fail("Enter a valid email address.");
            for (const key of ["phone", "guardian_phone"]) {
              if (changes[key]) {
                const number = localPhone(changes[key]);
                if (!number)
                  fail(
                    "Enter a 10-digit Sri Lankan phone number starting with 0, for example 077 123 4567.",
                  );
                changes[key] = number;
              }
            }
            for (const key of [
              "full_name",
              "email",
              "phone",
              "address_line1",
              "address_city",
            ])
              if (
                changes[key] === "" &&
                !(
                  student.category === "kids" &&
                  ["email", "phone"].includes(key) &&
                  nextContact.contact_recipient === "guardian"
                )
              )
                fail("Required fields cannot be blank.");
            if (
              ["address_line1", "address_line2", "address_city"].some(
                (k) => input[k] !== undefined,
              )
            ) {
              const address = { ...student, ...changes };
              if (!address.address_line1 || !address.address_city)
                fail("Address Line 1 and City / Town are required.");
              changes.home_address = [
                address.address_line1,
                address.address_line2,
                address.address_city,
              ]
                .filter(Boolean)
                .join(", ");
            }
            if (Object.keys(changes).length) {
              store.run(
                "UPDATE students SET " +
                  Object.keys(changes)
                    .map((k) => k + "=?")
                    .join(",") +
                  " WHERE id=?",
                ...Object.values(changes),
                student.id,
              );
              store.audit(
                actor,
                "Edited student profile",
                "student",
                student.id,
                { fields: Object.keys(changes) },
              );
            }
            if (input.note) {
              store.run(
                "INSERT INTO notes(id,student_id,actor_id,body,created_at) VALUES(?,?,?,?,?)",
                id(),
                student.id,
                actor.id,
                text(input.note, 4000),
                now(),
              );
              store.audit(actor, "Added student note", "student", student.id);
            }
          }
          if (["GET", "PATCH"].includes(method))
            return json(200, {
              ...store.one(studentSelect + " WHERE s.id=?", student.id),
              recipient_email: contactEmail(
                store.one(studentSelect + " WHERE s.id=?", student.id),
              ),
              enrollments: store.all(
                "SELECT e.*,c.name AS course_name,i.name AS intake_name,u.name AS actor_name FROM enrollments e LEFT JOIN courses c ON c.id=e.course_id LEFT JOIN intakes i ON i.id=e.intake_id LEFT JOIN users u ON u.id=e.confirmed_by WHERE e.student_id=? ORDER BY e.confirmed_at DESC",
                student.id,
              ),
              enrollment_history: store.all(
                "SELECT h.*,u.name AS actor_name FROM enrollment_history h JOIN enrollments e ON e.id=h.enrollment_id LEFT JOIN users u ON u.id=h.actor_id WHERE e.student_id=? ORDER BY h.created_at DESC",
                student.id,
              ),
              applications: store.all(
                "SELECT id,reference,status,registration_category AS category,enrollment_year,course_id,intake_id,created_at FROM applications WHERE student_id=? ORDER BY created_at DESC",
                student.id,
              ),
              notes: store.all(
                "SELECT n.*,u.name AS actor_name FROM notes n LEFT JOIN users u ON u.id=n.actor_id WHERE student_id=? ORDER BY created_at DESC",
                student.id,
              ),
              emails: store.all(
                "SELECT r.*,c.created_at FROM email_recipients r JOIN campaigns c ON c.id=r.campaign_id WHERE r.student_id=? ORDER BY c.created_at DESC",
                student.id,
              ),
              activity: store.all(
                "SELECT * FROM audit_events WHERE record_id=? ORDER BY id DESC",
                student.id,
              ),
            });
        }
        if (route === "/api/admin/activity" && method === "GET") {
          const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
          return json(200, {
            rows: store.all(
              "SELECT * FROM audit_events ORDER BY id DESC LIMIT 30 OFFSET ?",
              (page - 1) * 30,
            ),
            total: store.one("SELECT COUNT(*) n FROM audit_events").n,
            page,
            limit: 30,
          });
        }
        if (route === "/api/admin/templates") {
          need("email");
          if (method === "GET")
            return json(200, {
              rows: store.all(
                "SELECT * FROM templates WHERE archived_at IS " +
                  (url.searchParams.get("archived") === "true" ? "NOT " : "") +
                  "NULL ORDER BY name",
              ),
            });
          if (method === "POST") {
            administrator();
            const data = templateData(await body(req)),
              templateId = id();
            store.run(
              "INSERT INTO templates VALUES(?,?,?,?,?,?,?,?,?)",
              templateId,
              data.name,
              data.subject,
              data.html,
              data.text,
              data.kind,
              null,
              now(),
              now(),
            );
            store.audit(
              actor,
              "Created email template",
              "template",
              templateId,
            );
            return json(201, { id: templateId });
          }
        }
        match = route.match(/^\/api\/admin\/templates\/([a-zA-Z0-9-]+)$/);
        if (match && method === "PATCH") {
          administrator();
          const input = await body(req),
            old = store.one("SELECT * FROM templates WHERE id=?", match[1]);
          if (!old) fail("Template not found.", 404);
          if (input.archived !== undefined) {
            store.run(
              "UPDATE templates SET archived_at=?,updated_at=? WHERE id=?",
              input.archived ? now() : null,
              now(),
              old.id,
            );
            store.audit(
              actor,
              input.archived
                ? "Archived email template"
                : "Restored email template",
              "template",
              old.id,
            );
          } else {
            const data = templateData(input);
            store.run(
              "UPDATE templates SET name=?,subject=?,html=?,text=?,kind=?,updated_at=? WHERE id=?",
              data.name,
              data.subject,
              data.html,
              data.text,
              data.kind,
              now(),
              old.id,
            );
            store.audit(actor, "Edited email template", "template", old.id);
          }
          return json(200, { ok: true });
        }
        if (route === "/api/admin/email/preview" && method === "POST") {
          need("email");
          const data = templateData({ ...(await body(req)), name: "Preview" });
          const vars = {
            first_name: "Aiko",
            full_name: "Aiko Sample",
            application_reference: "SAMPLE-2027",
            student_id: "2704001",
            student_number: "2704001",
            registration_category: "Japanese Visa + Class",
            enrollment_year: "2027",
            course_name: "N5 Japanese",
            intake: "April 2027",
            institute_name: store.setting("institute").name,
          };
          return json(200, {
            subject: personalize(data.subject, vars),
            html: emailFrame(store, personalize(data.html, vars, true)),
            text: personalize(data.text, vars),
            sample: true,
          });
        }
        if (route === "/api/admin/email/recipients" && method === "GET") {
          need("email");
          const result = listRecords(
            store,
            url.searchParams,
            url.searchParams.get("source") === "students",
          );
          return json(200, {
            ...result,
            rows: result.rows.map((r) => ({
              id: r.id,
              full_name: r.full_name,
              email: contactEmail(r),
              contact_recipient: r.contact_recipient,
              registration_category: r.registration_category || r.category,
              student_number: r.student_number,
            })),
          });
        }
        if (route === "/api/admin/email/drafts" && method === "POST") {
          need("email");
          return json(
            201,
            prepareCampaign(store, await body(req), actor, {
              draft: true,
              baseUrl: config.baseUrl,
            }),
          );
        }
        if (route === "/api/admin/email/prepare" && method === "POST") {
          need("email");
          return json(
            201,
            prepareCampaign(store, await body(req), actor, {
              baseUrl: config.baseUrl,
            }),
          );
        }
        if (route === "/api/admin/email/campaigns" && method === "GET") {
          need("email");
          const filter = url.searchParams.get("status");
          return json(200, {
            rows: store.all(
              "SELECT c.*,u.name AS actor_name,(SELECT COUNT(*) FROM email_recipients WHERE campaign_id=c.id) AS recipient_count,(SELECT COUNT(*) FROM email_recipients WHERE campaign_id=c.id AND status='Failed') AS failed_count FROM campaigns c LEFT JOIN users u ON u.id=c.actor_id" +
                (filter ? " WHERE c.status=?" : "") +
                " ORDER BY c.created_at DESC LIMIT 100",
              ...(filter ? [filter] : []),
            ),
            enrollmentFailures: store.all(
              "SELECT n.application_id,n.error,n.created_at,a.full_name,a.reference FROM enrollment_notifications n JOIN applications a ON a.id=n.application_id WHERE n.campaign_id IS NULL AND n.error IS NOT NULL ORDER BY n.created_at DESC",
            ),
            automationFailures: store.all(
              "SELECT n.application_id,n.error,n.created_at,a.full_name,a.reference FROM approval_notifications n JOIN applications a ON a.id=n.application_id WHERE n.campaign_id IS NULL AND n.error IS NOT NULL ORDER BY n.created_at DESC",
            ),
            sendingEnabled: config.allowSend,
            smtpConfigured: smtpPublic(store).configured,
          });
        }
        match = route.match(
          /^\/api\/admin\/email\/campaigns\/([a-f0-9-]{36})(?:\/(queue))?$/,
        );
        if (match) {
          need("email");
          if (match[2] === "queue" && method === "POST")
            return json(
              200,
              queueCampaign(store, match[1], await body(req), actor, config),
            );
          if (method === "GET") {
            const campaign = store.one(
              "SELECT * FROM campaigns WHERE id=?",
              match[1],
            );
            if (!campaign) fail("Message not found.", 404);
            return json(200, {
              ...campaign,
              recipients: store.all(
                "SELECT id,email,full_name,subject,status,attempt_count,accepted_at,error FROM email_recipients WHERE campaign_id=?",
                campaign.id,
              ),
              attempts: store.all(
                "SELECT e.* FROM email_attempts e JOIN email_recipients r ON r.id=e.recipient_id WHERE r.campaign_id=? ORDER BY e.started_at",
                campaign.id,
              ),
            });
          }
        }
        if (route === "/api/admin/settings") {
          administrator();
          if (method === "GET")
            return json(200, {
              institute: store.setting("institute"),
              smtp: smtpPublic(store, config),
              courses: store.all("SELECT * FROM courses"),
              intakes: store.all("SELECT * FROM intakes"),
              schedules: store.all("SELECT * FROM schedules"),
            });
          if (method === "PATCH") {
            const input = await body(req);
            if (input.institute) {
              const next = { ...store.setting("institute") };
              for (const key of [
                "name",
                "email",
                "phone",
                "address",
                "logoUrl",
                "timezone",
                "privacyText",
              ])
                if (input.institute[key] !== undefined)
                  next[key] = text(
                    input.institute[key],
                    key === "privacyText" ? 3000 : 500,
                  );
              if (!next.name || (next.email && !emailValid(next.email)))
                fail("Enter a valid institute name and contact email.");
              if (next.logoUrl && !/^https:\/\/[^\s]+$/.test(next.logoUrl))
                fail("Logo URL must use HTTPS.");
              try {
                new Intl.DateTimeFormat("en", { timeZone: next.timezone });
              } catch {
                fail("Enter a valid timezone.");
              }
              store.set("institute", next);
              store.audit(
                actor,
                "Updated institute settings",
                "settings",
                "institute",
              );
            }
            return json(200, { ok: true });
          }
        }
        match = route.match(
          /^\/api\/admin\/settings\/(courses|intakes|schedules)$/,
        );
        if (match && method === "POST") {
          administrator();
          const input = await body(req),
            key = text(input.id || "", 50),
            name = text(input.name || "", 100);
          if (!/^[a-zA-Z0-9-]+$/.test(key) || !name)
            fail("Enter an ID and display name.");
          let intakeYear, intakeMonth;
          if (match[1] === "intakes") {
            intakeYear = Number(input.year || key.slice(0, 4));
            intakeMonth = Number(input.month || key.slice(5, 7));
            if (
              !Number.isInteger(intakeYear) ||
              intakeYear < 2000 ||
              intakeYear > 2099 ||
              !Number.isInteger(intakeMonth) ||
              intakeMonth < 1 ||
              intakeMonth > 12
            )
              fail("Enter an intake year from 2000–2099 and month from 1–12.");
            const oldIntake = store.one(
              "SELECT * FROM intakes WHERE id=?",
              key,
            );
            if (
              oldIntake &&
              (oldIntake.year !== intakeYear ||
                oldIntake.month !== intakeMonth) &&
              (store.one("SELECT id FROM enrollments WHERE intake_id=?", key) ||
                store.one("SELECT id FROM applications WHERE intake_id=?", key))
            )
              fail(
                "This intake is already used by registrations. Add a new intake instead of changing its year or month.",
              );
          }
          store.tx(() => {
            store.run(
              "INSERT INTO " +
                match[1] +
                "(id,name,active) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,active=excluded.active",
              key,
              name,
              input.active === false ? 0 : 1,
            );
            if (match[1] === "intakes")
              store.run(
                "UPDATE intakes SET year=?,month=? WHERE id=?",
                intakeYear,
                intakeMonth,
                key,
              );
          });
          store.audit(actor, "Updated " + match[1], "settings", key);
          return json(200, { ok: true });
        }
        if (route === "/api/admin/settings/smtp") {
          administrator();
          if (method === "GET") return json(200, smtpPublic(store, config));
          if (method === "PUT") {
            saveSmtp(store, await body(req), actor, config.key);
            return json(200, smtpPublic(store, config));
          }
        }
        if (
          route === "/api/admin/settings/smtp/test-connection" &&
          method === "POST"
        ) {
          administrator();
          const smtp = transport(store, config);
          try {
            await smtp.verify();
            store.audit(actor, "Tested SMTP connection", "settings", "smtp");
            return json(200, {
              message:
                "SMTP connection and authentication succeeded. No email was sent.",
            });
          } catch (error) {
            fail(safeMailError(error), 502);
          } finally {
            smtp.close?.();
          }
        }
        if (
          route === "/api/admin/settings/smtp/send-test" &&
          method === "POST"
        ) {
          administrator();
          if (!config.allowSend) fail("Live email sending is disabled.", 409);
          const input = await body(req);
          if (input.confirmed !== true || !emailValid(input.recipient))
            fail("Confirm a valid test recipient.");
          let template;
          if (input.template_id)
            template = store.one(
              "SELECT * FROM templates WHERE id=?",
              input.template_id,
            );
          const prepared = prepareCampaign(
            store,
            {
              subject: template?.subject || "Tomoni SMTP test",
              html:
                template?.html ||
                "<p>This is an explicitly requested SMTP test.</p>",
              text:
                template?.text || "This is an explicitly requested SMTP test.",
              kind: "operational",
              selection: { mode: "selected", source: "applications", ids: [] },
            },
            actor,
            { draft: true, baseUrl: config.baseUrl },
          );
          const campaign = store.one(
            "SELECT * FROM campaigns WHERE id=?",
            prepared.id,
          );
          const vars = templateVars(store, { full_name: "Test Recipient" });
          store.run(
            "INSERT INTO email_recipients(id,campaign_id,email,full_name,subject,html,text) VALUES(?,?,?,?,?,?,?)",
            id(),
            prepared.id,
            input.recipient,
            "Test recipient",
            personalize(campaign.subject, vars),
            emailFrame(store, personalize(campaign.html, vars, true)),
            personalize(campaign.text, vars),
          );
          queueCampaign(
            store,
            prepared.id,
            { confirmed: true, confirmationToken: prepared.confirmationToken },
            actor,
            config,
          );
          store.audit(
            actor,
            "Requested explicit test email",
            "campaign",
            prepared.id,
          );
          return json(200, {
            message:
              "Test email queued. Check Email Center for SMTP acceptance or failure.",
          });
        }
        if (route === "/api/admin/users") {
          administrator();
          if (method === "GET")
            return json(200, {
              rows: store.all(
                "SELECT id,name,email,role,permissions,active,created_at FROM users ORDER BY name",
              ),
            });
          if (method === "POST") {
            const input = await body(req),
              name = text(input.name || "", 120),
              email = text(input.email || "", 254).toLowerCase();
            if (
              !name ||
              !emailValid(email) ||
              !["Administrator", "Staff"].includes(input.role)
            )
              fail("Enter a valid name, email, and role.");
            if (
              typeof input.password !== "string" ||
              input.password.length < 12 ||
              input.password.length > 256
            )
              fail("Use a password between 12 and 256 characters.", 400, {
                password: "Use at least 12 characters.",
              });
            const userId = id(),
              permissions = {
                records: input.permissions?.records === true,
                email: input.permissions?.email === true,
                export: input.permissions?.export === true,
              };
            if (store.one("SELECT id FROM users WHERE email=?", email))
              fail("An account already uses this email.");
            store.run(
              "INSERT INTO users VALUES(?,?,?,?,?,?,?,?)",
              userId,
              name,
              email,
              passwordHash(input.password),
              input.role,
              JSON.stringify(permissions),
              1,
              now(),
            );
            store.audit(actor, "Created staff account", "user", userId, {
              role: input.role,
              permissions,
            });
            return json(201, { id: userId });
          }
        }
        match = route.match(/^\/api\/admin\/users\/([a-f0-9-]{36})$/);
        if (match && method === "PATCH") {
          administrator();
          const input = await body(req),
            old = store.one("SELECT * FROM users WHERE id=?", match[1]);
          if (!old) fail("User not found.", 404);
          const role = input.role || old.role,
            active =
              input.active === undefined ? old.active : input.active ? 1 : 0;
          if (!["Administrator", "Staff"].includes(role)) fail("Invalid role.");
          if (
            old.role === "Administrator" &&
            (role !== "Administrator" || !active) &&
            store.one(
              "SELECT COUNT(*) n FROM users WHERE role='Administrator' AND active=1",
            ).n <= 1
          )
            fail("Keep at least one active administrator.");
          if (old.id === actor.id && !active)
            fail("You cannot deactivate your own account.");
          const permissions = input.permissions
            ? {
                records: input.permissions.records === true,
                email: input.permissions.email === true,
                export: input.permissions.export === true,
              }
            : JSON.parse(old.permissions);
          if (input.password) {
            if (
              typeof input.password !== "string" ||
              input.password.length < 12 ||
              input.password.length > 256
            )
              fail("Use a password between 12 and 256 characters.", 400, {
                password: "Use at least 12 characters.",
              });
          }
          store.run(
            "UPDATE users SET role=?,active=?,permissions=? WHERE id=?",
            role,
            active,
            JSON.stringify(permissions),
            old.id,
          );
          if (input.password) {
            store.run(
              "UPDATE users SET password_hash=? WHERE id=?",
              passwordHash(input.password),
              old.id,
            );
          }
          store.run("DELETE FROM sessions WHERE user_id=?", old.id);
          store.audit(actor, "Updated account permissions", "user", old.id, {
            role,
            active,
            permissions,
            passwordChanged: !!input.password,
          });
          return json(200, { ok: true });
        }
        fail("Endpoint not found.", 404);
      }
      if (!["GET", "HEAD"].includes(method)) fail("Method not allowed.", 405);
      if (
        route === "/admin" ||
        (route.startsWith("/admin/") && !publicAssets[route])
      ) {
        if (!actor) {
          res.writeHead(302, { Location: "/admin/login" });
          return res.end();
        }
        return sendAsset("admin/index.html");
      }
      const asset = publicAssets[route];
      if (asset) return await sendAsset(asset);
      fail("Not found.", 404);
    } catch (error) {
      if (error instanceof HttpError)
        return json(error.status, {
          error: error.message,
          fields: error.fields,
        });
      if (
        error.message?.includes("database is locked") ||
        error.code === "SQLITE_BUSY"
      )
        return json(503, {
          error:
            "Another enrollment is being saved. Retry the same confirmation; an assigned number will be preserved.",
        });
      if (
        error.message?.includes("An email address can register only once") ||
        error.message?.includes("A student may have only one registration")
      )
        return json(409, {
          error:
            "This student or email is already registered. Edit the existing registration instead of adding another category or class.",
        });
      if (error.message?.includes("UNIQUE constraint"))
        return json(409, {
          error: "This record already exists. Refresh and try again.",
        });
      if (
        error.message?.includes("Student number must") ||
        error.message?.includes("CHECK constraint") ||
        error.message?.includes("FOREIGN KEY constraint") ||
        error.message?.includes("NOT NULL constraint")
      ) {
        console.error("Database constraint failed:", error);
        return json(400, {
          error: error.message,
        });
      }
      console.error("Request failed:", error);
      return json(500, {
        error:
          "Something went wrong. Please try again or contact an administrator.",
      });
    }
  });
  server.store = store;
  server.worker = worker;
  server.on("close", () => {
    worker.stop();
    if (!options.store) store.db.close();
  });
  return server;
}
if (
  typeof process !== "undefined" &&
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  if (
    environment.NODE_ENV === "production" &&
    !/^https:\/\//.test(environment.PUBLIC_URL || "")
  )
    throw new Error("Set PUBLIC_URL to your HTTPS site URL for production.");
  const server = createServer();
  server.listen(
    Number(environment.PORT) || 3000,
    environment.HOST || "127.0.0.1",
    () =>
      console.log(
        "Tomoni is running at " +
          (environment.PUBLIC_URL || "http://127.0.0.1:3000"),
      ),
  );
  for (const signal of ["SIGINT", "SIGTERM"])
    process.on(signal, () => server.close(() => process.exit(0)));
}
