CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Beginner Guide',
  read_time TEXT NOT NULL DEFAULT '5 min read',
  featured_image TEXT NOT NULL DEFAULT '/assets/hero.jpg',
  author TEXT NOT NULL DEFAULT 'Tomoni Academic Faculty',
  meta_title TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  keywords TEXT NOT NULL DEFAULT '',
  canonical_url TEXT NOT NULL DEFAULT '',
  is_published INTEGER NOT NULL DEFAULT 1,
  published_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at);

INSERT OR IGNORE INTO blog_posts(
  id, slug, title, summary, content, category, read_time, featured_image, author,
  meta_title, meta_description, keywords, canonical_url, is_published, published_at, created_at, updated_at
) VALUES (
  'blog_how_to_learn_japanese_in_sri',
  'how-to-learn-japanese-in-sri-lanka-beginner-guide',
  'How to Learn Japanese in Sri Lanka: Complete Beginner Guide',
  'Learning Japanese opens tremendous academic and career opportunities for Sri Lankan youth. This complete guide walks you through the writing scripts, vocabulary strategy, certified exams, and choosing the right classes.',
  'Japan has emerged as one of the most attractive destinations for Sri Lankan school leavers and graduates seeking high-standard university education, technological skills, and prosperous career paths. However, the cornerstone of every successful journey to Japan is a solid command of the Japanese language.

Many beginners feel overwhelmed when looking at Japanese characters for the first time. The good news is that the Japanese phonetic system is remarkably straightforward—especially for Sinhala and Tamil speakers who are already accustomed to phonetic vowel structures.

Japanese uses three interconnected scripts: Hiragana (46 phonetic characters used for native Japanese words and grammar particles), Katakana (46 characters used for foreign loanwords and international names), and Kanji (logographic characters imported originally from Chinese to represent core ideas and meanings).

For beginners, the Japanese Language Proficiency Test (JLPT) serves as the international benchmark. Starting at JLPT N5, students master around 100 Kanji and 800 everyday words. Progressing to N4 qualifies candidates for student visas and Specified Skilled Worker (SSW) programs.

At Tomoni Japanese Language Center in Kuliyapitiya, we provide structured physical and interactive online classes that combine grammar breakdowns with authentic speaking practice, ensuring students don''t just memorize rules for tests, but develop real communication skills.',
  'Beginner Guide',
  '7 min read',
  '/assets/hero.jpg',
  'Tomoni Academic Faculty',
  'How to Learn Japanese in Sri Lanka: Complete Beginner Guide | Tomoni',
  'A comprehensive guide on learning Japanese in Sri Lanka. Discover scripts (Hiragana, Katakana, Kanji), JLPT exams, class options in Kuliyapitiya, and career pathways in Japan.',
  'Japanese Language Sri Lanka, JLPT, Study in Japan',
  '',
  1,
  '2025-01-15T09:00:00.000Z',
  '2025-01-15T09:00:00.000Z',
  '2025-02-10T09:00:00.000Z'
);

INSERT OR IGNORE INTO blog_posts(
  id, slug, title, summary, content, category, read_time, featured_image, author,
  meta_title, meta_description, keywords, canonical_url, is_published, published_at, created_at, updated_at
) VALUES (
  'blog_why_sri_lankan_students_shou',
  'why-sri-lankan-students-should-learn-japanese',
  'Why Should Sri Lankan Students Learn Japanese? Opportunities & Benefits',
  'From world-class technological universities to high-demand employment sectors under the SSW program, Japan offers unprecedented opportunities for skilled Sri Lankan youth with Japanese fluency.',
  'Japan is currently experiencing a historic demand for young, motivated international talent across fields such as nursing and healthcare, information technology, hospitality, agriculture, food production, and engineering.

Unlike many Western destinations with prohibitive tuition fees, studying in Japan is cost-effective. Furthermore, Japanese immigration law permits international students to work part-time up to 28 hours per week during academic semesters and up to 40 hours per week during vacations, allowing students to cover their living expenses independently.

For students not seeking a university degree, Japan''s Specified Skilled Worker (SSW) visa program provides direct working opportunities in 12 designated industries with standard Japanese domestic salaries, health insurance, and pension benefits.

Cultural affinity between Sri Lanka and Japan makes adaptation smooth. Mutual respect, cleanliness, safety, and Buddhist heritage create a welcoming atmosphere where Sri Lankan youth thrive and build rewarding futures.',
  'Career & Education',
  '6 min read',
  '/assets/street.jpg',
  'Tomoni Career Guidance Team',
  'Why Learn Japanese? Opportunities for Sri Lankan Students | Tomoni',
  'Explore why learning Japanese is a life-changing decision for Sri Lankan students. Discover higher education options, SSW work visas, high salaries, and cultural benefits.',
  'Japanese Language Sri Lanka, JLPT, Study in Japan',
  '',
  1,
  '2025-01-20T09:00:00.000Z',
  '2025-01-20T09:00:00.000Z',
  '2025-02-12T09:00:00.000Z'
);

INSERT OR IGNORE INTO blog_posts(
  id, slug, title, summary, content, category, read_time, featured_image, author,
  meta_title, meta_description, keywords, canonical_url, is_published, published_at, created_at, updated_at
) VALUES (
  'blog_japanese_jlpt_n5_complete_be',
  'japanese-jlpt-n5-complete-beginner-guide',
  'Japanese JLPT N5: The Complete Beginner Examination Guide',
  'A complete breakdown of the JLPT N5 examination. Learn the exact syllabus breakdown, vocabulary requirements, passing marks, and recommended daily study routine.',
  'The Japanese Language Proficiency Test (JLPT) is administered worldwide by the Japan Foundation and Japan Educational Exchanges and Services. N5 is the introductory level, confirming ability to comprehend basic Japanese sentences written in Hiragana, Katakana, and basic Kanji.

The N5 exam is divided into three sections: Language Knowledge (Vocabulary), Language Knowledge (Grammar & Reading), and Listening. The entire test carries 180 total points, with an overall passing threshold of 80 points, alongside sectional minimum pass marks.

To comfortably pass, students need to know approximately 100 Kanji, around 800 common words, and core grammatical patterns such as te-form, nai-form, polite present/past tenses, and elementary particles.

Consistent audio practice is critical. At Tomoni, our JLPT N5 curriculum includes weekly audio comprehension drills using native Japanese recordings so students are never surprised by the pace of the actual exam.',
  'Exam Preparation',
  '8 min read',
  '/assets/temple.jpg',
  'Tomoni Academic Faculty',
  'JLPT N5 Complete Guide: Syllabus, Marks & Tips for Sri Lanka | Tomoni',
  'Everything you need to pass JLPT N5 in Sri Lanka: test format, Kanji list, grammar structures, listening tips, and minimum passing marks.',
  'Japanese Language Sri Lanka, JLPT, Study in Japan',
  '',
  1,
  '2025-01-25T09:00:00.000Z',
  '2025-01-25T09:00:00.000Z',
  '2025-02-14T09:00:00.000Z'
);

INSERT OR IGNORE INTO blog_posts(
  id, slug, title, summary, content, category, read_time, featured_image, author,
  meta_title, meta_description, keywords, canonical_url, is_published, published_at, created_at, updated_at
) VALUES (
  'blog_jlpt_n5_vs_n4_difference_gui',
  'jlpt-n5-vs-n4-difference-guide',
  'JLPT N5 vs N4: What is the Difference and Which Should You Take?',
  'Comparing JLPT N5 and N4 in terms of difficulty, preparation time, Kanji, grammar complexity, and what Japanese immigration and universities expect.',
  'While JLPT N5 validates basic recognition, JLPT N4 represents functional everyday Japanese. The jump between the two levels is significant: vocabulary doubles from 800 words to approximately 1,500 words, and Kanji requirements triple from 100 to about 300 characters.

In terms of grammar, N5 focuses on simple static sentences (''I go to school by bus''). N4 introduces compound clauses, conditional expressions (if/when), passive voice, causative forms, and respectful language (keigo).

For student visas to Japanese language schools, JLPT N5 or NAT-TEST 5Q is generally the minimum requirement. However, for vocational college entry, direct SSW employment visas, or caregiver positions, Japanese authorities and employers strongly favor JLPT N4.

If you have already cleared N5 or completed foundational studies, joining Tomoni''s structured N4 program guarantees you reach functional conversational fluency in just 4 to 6 months.',
  'Exam Preparation',
  '5 min read',
  '/assets/hero.jpg',
  'Tomoni Academic Faculty',
  'JLPT N5 vs JLPT N4: Key Differences & Requirements | Tomoni',
  'Understand the differences between JLPT N5 and N4: vocabulary size, Kanji requirements, grammar difficulty, and immigration eligibility for Japan.',
  'Japanese Language Sri Lanka, JLPT, Study in Japan',
  '',
  1,
  '2025-02-01T09:00:00.000Z',
  '2025-02-01T09:00:00.000Z',
  '2025-02-15T09:00:00.000Z'
);

INSERT OR IGNORE INTO blog_posts(
  id, slug, title, summary, content, category, read_time, featured_image, author,
  meta_title, meta_description, keywords, canonical_url, is_published, published_at, created_at, updated_at
) VALUES (
  'blog_how_to_prepare_for_jlpt_exam',
  'how-to-prepare-for-jlpt-exam-sri-lanka',
  'How to Prepare for the JLPT Examination in Sri Lanka',
  'Practical tips for Sri Lankan students preparing for the July and December JLPT sessions: registration timelines, recommended textbooks, and mock test routines.',
  'In Sri Lanka, the JLPT is held twice yearly—on the first Sunday of July and the first Sunday of December—overseen by the Japanese Language Teachers'' Association of Sri Lanka (JLTAS) and the Embassy of Japan.

Preparation must be balanced across all test components. Over-focusing on vocabulary while ignoring listening comprehension is a common mistake that causes otherwise diligent students to miss sectional cutoffs.

At Tomoni, we conduct full-length simulated mock exams under strict test hall conditions. This builds mental stamina and eliminates exam anxiety before the official test day.',
  'Exam Preparation',
  '6 min read',
  '/assets/torii.jpg',
  'Tomoni Academic Faculty',
  'JLPT Exam Preparation in Sri Lanka: Tips, Dates & Past Papers | Tomoni',
  'Step-by-step revision strategy for JLPT candidates in Sri Lanka. How to register, use past papers, manage exam timing, and avoid common errors.',
  'Japanese Language Sri Lanka, JLPT, Study in Japan',
  '',
  1,
  '2025-02-05T09:00:00.000Z',
  '2025-02-05T09:00:00.000Z',
  '2025-02-16T09:00:00.000Z'
);

INSERT OR IGNORE INTO blog_posts(
  id, slug, title, summary, content, category, read_time, featured_image, author,
  meta_title, meta_description, keywords, canonical_url, is_published, published_at, created_at, updated_at
) VALUES (
  'blog_best_way_to_learn_hiragana_a',
  'best-way-to-learn-hiragana-and-katakana',
  'The Best Way to Learn Japanese Hiragana and Katakana in 7 Days',
  'Don''t let Japanese scripts intimidate you. Follow our proven 7-day mnemonic learning plan to read and write both phonetic alphabets effortlessly.',
  'Every student learning Japanese must start with Hiragana and Katakana (collectively known as Kana). Each script consists of 46 primary characters arranged in a logical 5x10 phonetic grid matching the five Japanese vowels (a, i, u, e, o).

By studying one row per day using mnemonic associations (visual stories that link the shape of the character to its sound), students can memorize all 46 Hiragana within 5 days and Katakana in the subsequent week.

Writing characters by hand with the correct stroke order is essential for building motor memory and developing clean, legible Japanese handwriting.',
  'Beginner Guide',
  '6 min read',
  '/assets/temple.jpg',
  'Tomoni Japanese Faculty',
  'Master Hiragana & Katakana in 7 Days: Beginner Japanese Guide | Tomoni',
  'A step-by-step method to memorize all 46 Hiragana and 46 Katakana characters with mnemonic associations, stroke order rules, and free practice exercises.',
  'Japanese Language Sri Lanka, JLPT, Study in Japan',
  '',
  1,
  '2025-02-08T09:00:00.000Z',
  '2025-02-08T09:00:00.000Z',
  '2025-02-17T09:00:00.000Z'
);

INSERT OR IGNORE INTO blog_posts(
  id, slug, title, summary, content, category, read_time, featured_image, author,
  meta_title, meta_description, keywords, canonical_url, is_published, published_at, created_at, updated_at
) VALUES (
  'blog_japanese_language_skills_for',
  'japanese-language-skills-for-working-in-japan',
  'Japanese Language Skills Needed for Working in Japan: Visas & Requirements',
  'A complete guide to Japanese language requirements across different career pathways in Japan: SSW, Engineering/Humanities, and Nursing Care.',
  'Landing a professional job in Japan requires more than technical qualifications—it requires communication fluency and cultural etiquette. The exact level of Japanese required depends on your industry and visa category.

For Specified Skilled Worker (SSW) visas, candidates must hold either JLPT N4 or JFT-Basic A2 certification, accompanied by passing the sector-specific skills assessment test in Colombo.

For university graduates entering IT or international trade, achieving JLPT N3 or N2 opens doors to permanent full-time positions (Seishain) with competitive salaries and clear career progression.

Tomoni''s specialized JFT-Basic and General Japanese classes focus heavily on real workplace scenarios, telephone handling, email conventions, and employer interview coaching.',
  'Career & Education',
  '7 min read',
  '/assets/street.jpg',
  'Tomoni Career Guidance Team',
  'Japanese Language Skills for Working in Japan: SSW & Work Visas | Tomoni',
  'What level of Japanese do you actually need to work in Japan? Discover language criteria for SSW visas, IT jobs, caregiver roles, and corporate careers.',
  'Japanese Language Sri Lanka, JLPT, Study in Japan',
  '',
  1,
  '2025-02-10T09:00:00.000Z',
  '2025-02-10T09:00:00.000Z',
  '2025-02-18T09:00:00.000Z'
);

INSERT OR IGNORE INTO blog_posts(
  id, slug, title, summary, content, category, read_time, featured_image, author,
  meta_title, meta_description, keywords, canonical_url, is_published, published_at, created_at, updated_at
) VALUES (
  'blog_study_in_japan_guide_for_sri',
  'study-in-japan-guide-for-sri-lankan-students',
  'Study in Japan: Complete Step-by-Step Guide for Sri Lankan Students',
  'Everything Sri Lankan students and parents need to know about pursuing higher education in Japan: timelines, costs, scholarships, and ethical visa documentation.',
  'Japan has become one of the top choices for ambitious Sri Lankan students. Japanese degrees are globally respected, tuition fees are reasonable compared to Western alternatives, and immigration regulations allow legal part-time employment to support living costs.

The primary step is achieving verified Japanese language competency (minimum 150 study hours or JLPT N5). The application is then submitted to an accredited language school or university in Japan.

The Japanese Immigration Bureau reviews documents to grant a Certificate of Eligibility (COE). Once the COE is issued, the visa is endorsed by the Embassy of Japan in Colombo.

At Tomoni Japanese Language Center, we guide students through every single stage with transparency and zero hidden fees, maintaining an exceptional COE acceptance record.',
  'Career & Education',
  '9 min read',
  '/assets/hero.jpg',
  'Tomoni Admissions Office',
  'Study in Japan Guide for Sri Lankan Students: Admissions & Visas | Tomoni',
  'Detailed step-by-step roadmap to studying in Japan from Sri Lanka: language preparation, school admission, COE application, embassy interview, and living costs.',
  'Japanese Language Sri Lanka, JLPT, Study in Japan',
  '',
  1,
  '2025-02-12T09:00:00.000Z',
  '2025-02-12T09:00:00.000Z',
  '2025-02-19T09:00:00.000Z'
);

INSERT OR IGNORE INTO blog_posts(
  id, slug, title, summary, content, category, read_time, featured_image, author,
  meta_title, meta_description, keywords, canonical_url, is_published, published_at, created_at, updated_at
) VALUES (
  'blog_japanese_language_learning_t',
  'japanese-language-learning-tips-beginners',
  '10 Japanese Language Learning Tips for Sri Lankan Beginners',
  'Accelerate your Japanese progress with these 10 actionable learning habits used by top-scoring JLPT candidates and bilingual professionals.',
  'Consistency always outperforms cramming when learning Japanese. Studying 30 minutes every single day is vastly more effective than studying for six hours once a week.

Leverage spaced repetition software (like Anki) to review Kanji characters just before your brain naturally forgets them. This cements vocabulary into long-term memory with minimal wasted effort.

Use the ''shadowing'' technique: listen to native Japanese audio and repeat the words out loud with just a split-second delay, mimicking natural pitch, intonation, and rhythm.',
  'Beginner Guide',
  '5 min read',
  '/assets/torii.jpg',
  'Tomoni Japanese Faculty',
  '10 Japanese Learning Tips for Beginners: Speed Up Your Fluency | Tomoni',
  'Practical, proven tips to accelerate your Japanese language learning: spaced repetition, shadowing techniques, immersion hacks, and speaking practice.',
  'Japanese Language Sri Lanka, JLPT, Study in Japan',
  '',
  1,
  '2025-02-14T09:00:00.000Z',
  '2025-02-14T09:00:00.000Z',
  '2025-02-20T09:00:00.000Z'
);

INSERT OR IGNORE INTO blog_posts(
  id, slug, title, summary, content, category, read_time, featured_image, author,
  meta_title, meta_description, keywords, canonical_url, is_published, published_at, created_at, updated_at
) VALUES (
  'blog_common_japanese_language_mis',
  'common-japanese-language-mistakes-beginners-make',
  '7 Common Japanese Language Mistakes Beginners Make (and How to Avoid Them)',
  'A guide to the most frequent stumbling blocks for beginner students—from particle mix-ups to literal translations—and how to fix them early.',
  'One of the biggest hurdles for beginner Japanese learners is the distinction between particles ''wa'' (topic marker) and ''ga'' (subject identifier). Mastering this early prevents persistent grammar confusion later.

Another frequent error is trying to translate English idioms directly into Japanese. Japanese is a contextual language where subjects are naturally omitted when obvious from the setting.

At Tomoni Japanese Language Center, our interactive coaching helps students identify and correct these bad habits early on, establishing clean, natural conversational fluency from day one.',
  'Beginner Guide',
  '6 min read',
  '/assets/street.jpg',
  'Tomoni Academic Faculty',
  '7 Common Japanese Mistakes Beginners Make | Tomoni Japanese Center',
  'Avoid these common Japanese pitfalls: particle confusion (wa vs ga), translating word-for-word, misusing honorifics, and ignoring pitch accent.',
  'Japanese Language Sri Lanka, JLPT, Study in Japan',
  '',
  1,
  '2025-02-18T09:00:00.000Z',
  '2025-02-18T09:00:00.000Z',
  '2025-02-21T09:00:00.000Z'
);

