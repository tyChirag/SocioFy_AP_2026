DROP TABLE IF EXISTS project_member CASCADE;
DROP TABLE IF EXISTS project_skill CASCADE;
DROP TABLE IF EXISTS project CASCADE;
DROP TABLE IF EXISTS event_registration CASCADE;
DROP TABLE IF EXISTS event CASCADE;
DROP TABLE IF EXISTS community_membership CASCADE;
DROP TABLE IF EXISTS community CASCADE;
DROP TABLE IF EXISTS student CASCADE;

CREATE TABLE student (
    student_id INT GENERATED ALWAYS AS IDENTITY (START WITH 1001 INCREMENT BY 1),
    full_name VARCHAR(100) NOT NULL,
    college_email VARCHAR(150) NOT NULL,
    college_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    terms_accepted BOOLEAN DEFAULT FALSE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_student PRIMARY KEY (student_id),
    CONSTRAINT uq_student_email UNIQUE (college_email),
    CONSTRAINT chk_student_email_format CHECK (college_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_student_academic_year CHECK (academic_year IN ('1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'Other'))
);

CREATE TABLE community (
    community_id INT GENERATED ALWAYS AS IDENTITY (START WITH 5001 INCREMENT BY 1),
    community_name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_community PRIMARY KEY (community_id),
    CONSTRAINT uq_community_name UNIQUE (community_name)
);

CREATE TABLE community_membership (
    student_id INT NOT NULL,
    community_id INT NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role VARCHAR(30) DEFAULT 'Member' NOT NULL,
    CONSTRAINT pk_community_membership PRIMARY KEY (student_id, community_id),
    CONSTRAINT fk_comm_mem_student FOREIGN KEY (student_id) REFERENCES student (student_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_comm_mem_community FOREIGN KEY (community_id) REFERENCES community (community_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_community_membership_role CHECK (role IN ('Member', 'Moderator', 'Lead', 'Admin'))
);

CREATE TABLE event (
    event_id INT GENERATED ALWAYS AS IDENTITY (START WITH 8001 INCREMENT BY 1),
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    location VARCHAR(150) NOT NULL,
    description TEXT,
    organizer VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_event PRIMARY KEY (event_id)
);

CREATE TABLE event_registration (
    event_id INT NOT NULL,
    student_id INT NOT NULL,
    registered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status VARCHAR(30) DEFAULT 'Registered' NOT NULL,
    CONSTRAINT pk_event_registration PRIMARY KEY (event_id, student_id),
    CONSTRAINT fk_event_reg_event FOREIGN KEY (event_id) REFERENCES event (event_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_event_reg_student FOREIGN KEY (student_id) REFERENCES student (student_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_event_registration_status CHECK (status IN ('Registered', 'Confirmed', 'Waitlisted', 'Cancelled', 'Attended'))
);

CREATE TABLE project (
    project_id INT GENERATED ALWAYS AS IDENTITY (START WITH 3001 INCREMENT BY 1),
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    owner_id INT NOT NULL,
    open_positions SMALLINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_project PRIMARY KEY (project_id),
    CONSTRAINT fk_project_owner FOREIGN KEY (owner_id) REFERENCES student (student_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_project_positions CHECK (open_positions >= 0)
);

CREATE TABLE project_skill (
    project_id INT NOT NULL,
    skill_name VARCHAR(50) NOT NULL,
    CONSTRAINT pk_project_skill PRIMARY KEY (project_id, skill_name),
    CONSTRAINT fk_project_skill_project FOREIGN KEY (project_id) REFERENCES project (project_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE project_member (
    project_id INT NOT NULL,
    student_id INT NOT NULL,
    member_role VARCHAR(50) NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_project_member PRIMARY KEY (project_id, student_id),
    CONSTRAINT fk_project_member_project FOREIGN KEY (project_id) REFERENCES project (project_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_project_member_student FOREIGN KEY (student_id) REFERENCES student (student_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_student_email ON student (college_email);
CREATE INDEX idx_student_dept ON student (department);
CREATE INDEX idx_community_category ON community (category);
CREATE INDEX idx_event_timestamp ON event (event_date);
CREATE INDEX idx_project_owner ON project (owner_id);
CREATE INDEX idx_project_cat ON project (category);

CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_student_updated_at
BEFORE UPDATE ON student
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

INSERT INTO student (full_name, college_email, college_name, department, academic_year, password_hash, is_verified)
VALUES 
('Chirag Tyagi', 'chirag@college.edu', 'Rishihood University', 'Computer Science', '3rd Year', '$2a$10$e8wE4yPjXU8.F8NqP8Z8ueGj1aW4L9U4T1rB6h3Y8v5K2n0m7x8y9', TRUE),
('Aarav Sharma', 'aarav@college.edu', 'Rishihood University', 'Design', '2nd Year', '$2a$10$e8wE4yPjXU8.F8NqP8Z8ueGj1aW4L9U4T1rB6h3Y8v5K2n0m7x8y9', TRUE),
('Priya Patel', 'priya@college.edu', 'Rishihood University', 'Computer Science', '3rd Year', '$2a$10$e8wE4yPjXU8.F8NqP8Z8ueGj1aW4L9U4T1rB6h3Y8v5K2n0m7x8y9', TRUE);

INSERT INTO community (community_name, description, category)
VALUES
('Web3 & Blockchain Club', 'Exploring decentralized protocols, smart contracts, and distributed ledger systems.', 'Technology'),
('AI & Machine Learning Society', 'Deep learning architectures, generative models, and algorithmic optimization.', 'Technology'),
('Campus Design Hub', 'User experience, visual communication, design systems, and interaction design.', 'Design');

INSERT INTO community_membership (student_id, community_id, role)
VALUES
(1001, 5001, 'Lead'),
(1001, 5002, 'Member'),
(1002, 5003, 'Moderator'),
(1003, 5002, 'Member');

INSERT INTO event (title, category, event_date, location, description, organizer)
VALUES
('Annual Campus Hackathon 2026', 'Hackathon', '2026-03-15 09:00:00+00', 'Auditorium Hall B', '36-hour competitive hackathon focused on institutional and open-source infrastructure.', 'SocioFy Community Team'),
('Advanced State Management in React Workshop', 'Workshop', '2026-03-20 16:00:00+00', 'Lab 4', 'Deep dive into concurrent rendering, state isolation, and performant UI patterns.', 'Web3 & Blockchain Club');

INSERT INTO event_registration (event_id, student_id, status)
VALUES
(8001, 1001, 'Confirmed'),
(8001, 1002, 'Confirmed'),
(8002, 1003, 'Registered');

INSERT INTO project (title, description, category, owner_id, open_positions)
VALUES
('SocioFy Platform', 'Decentralized campus collaboration network with real-time peer matching.', 'Web Development', 1001, 2),
('Autonomous Campus Rover', 'LiDAR and SLAM-guided autonomous robotic unit for intramural transport.', 'Robotics', 1003, 3);

INSERT INTO project_skill (project_id, skill_name)
VALUES
(3001, 'React'),
(3001, 'Node.js'),
(3001, 'PostgreSQL'),
(3001, 'Tailwind CSS'),
(3002, 'Python'),
(3002, 'ROS2'),
(3002, 'OpenCV');

INSERT INTO project_member (project_id, student_id, member_role)
VALUES
(3001, 1001, 'Architect & Lead Engineer'),
(3001, 1002, 'Lead UI/UX Designer'),
(3002, 1003, 'Robotics Systems Lead');
