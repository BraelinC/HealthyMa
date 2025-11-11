-- Create community meal courses tables
CREATE TABLE IF NOT EXISTS community_meal_courses (
  id SERIAL PRIMARY KEY,
  community_id INTEGER NOT NULL REFERENCES communities(id),
  creator_id VARCHAR NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  emoji VARCHAR(10),
  description TEXT,
  cover_image TEXT,
  category VARCHAR(100),
  lesson_count INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  drip_enabled BOOLEAN DEFAULT false,
  drip_days JSON DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_meal_course_modules (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES community_meal_courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  emoji VARCHAR(10),
  description TEXT,
  module_order INTEGER NOT NULL,
  is_expanded BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_meal_lessons (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES community_meal_courses(id) ON DELETE CASCADE,
  module_id INTEGER REFERENCES community_meal_course_modules(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  emoji VARCHAR(10),
  description TEXT,
  video_url TEXT,
  youtube_video_id VARCHAR(50),
  image_url TEXT,
  ingredients JSON NOT NULL DEFAULT '[]',
  instructions JSON NOT NULL DEFAULT '[]',
  prep_time INTEGER DEFAULT 0,
  cook_time INTEGER DEFAULT 0,
  servings INTEGER DEFAULT 4,
  difficulty_level INTEGER DEFAULT 1,
  nutrition_info JSON DEFAULT '{}',
  lesson_order INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_meal_lesson_sections (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER NOT NULL REFERENCES community_meal_lessons(id) ON DELETE CASCADE,
  section_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  template_id VARCHAR(50),
  display_order INTEGER NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS meal_courses_community_idx ON community_meal_courses(community_id);
CREATE INDEX IF NOT EXISTS meal_courses_creator_idx ON community_meal_courses(creator_id);
CREATE INDEX IF NOT EXISTS meal_courses_published_idx ON community_meal_courses(is_published);

CREATE INDEX IF NOT EXISTS meal_modules_course_idx ON community_meal_course_modules(course_id);
CREATE INDEX IF NOT EXISTS meal_modules_order_idx ON community_meal_course_modules(course_id, module_order);

CREATE INDEX IF NOT EXISTS meal_lessons_course_idx ON community_meal_lessons(course_id);
CREATE INDEX IF NOT EXISTS meal_lessons_order_idx ON community_meal_lessons(course_id, lesson_order);
CREATE INDEX IF NOT EXISTS meal_lessons_published_idx ON community_meal_lessons(is_published);

CREATE INDEX IF NOT EXISTS lesson_sections_lesson_idx ON community_meal_lesson_sections(lesson_id);
CREATE INDEX IF NOT EXISTS lesson_sections_order_idx ON community_meal_lesson_sections(lesson_id, display_order);