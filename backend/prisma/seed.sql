-- Seed data for development

-- Insert roles
INSERT INTO roles (name, description) VALUES
    ('Admin', 'Full system access'),
    ('Editor', 'Can create and edit news'),
    ('Subscriber', 'Can subscribe to categories')
ON CONFLICT (name) DO NOTHING;

-- Insert categories
INSERT INTO categories (name, description) VALUES
    ('Технологии', 'Новости из мира технологий'),
    ('Наука', 'Научные открытия и исследования'),
    ('Спорт', 'Спортивные события'),
    ('Политика', 'Политические новости'),
    ('Экономика', 'Экономические новости')
ON CONFLICT (name) DO NOTHING;

-- Insert admin user (password: admin123)
-- BCrypt hash for 'admin123' with 12 rounds
INSERT INTO users (username, email, password_hash, is_active) VALUES
    ('admin', 'admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYfVgz6T6Ke', true)
ON CONFLICT (username) DO NOTHING;

-- Assign admin role to admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'Admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Insert sample news
INSERT INTO news (title, content, category_id, author_id) VALUES
    (
        'Новая версия TypeScript 5.0',
        'Microsoft выпустила новую версию TypeScript с улучшенной поддержкой декораторов.',
        (SELECT id FROM categories WHERE name = 'Технологии'),
        (SELECT id FROM users WHERE username = 'admin')
    ),
    (
        'Открытие новой экзопланеты',
        'Астрономы обнаружили потенциально обитаемую экзопланету в системе Proxima Centauri.',
        (SELECT id FROM categories WHERE name = 'Наука'),
        (SELECT id FROM users WHERE username = 'admin')
    );
