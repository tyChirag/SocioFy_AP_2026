\timing on

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT student_id, full_name, college_email, department, academic_year
FROM student
WHERE department = 'Computer Science' AND is_verified = TRUE
ORDER BY full_name;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT department, COUNT(*) AS total_students
FROM student GROUP BY department
ORDER BY total_students DESC, department;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT c.community_id, c.community_name, c.category,
COUNT(cm.student_id) AS total_members
FROM community c LEFT JOIN community_membership cm
ON c.community_id = cm.community_id
GROUP BY c.community_id, c.community_name, c.category
ORDER BY total_members DESC;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT c.community_name, s.full_name, s.department,
cm.role, cm.joined_at
FROM community_membership cm
JOIN student s ON cm.student_id = s.student_id
JOIN community c ON cm.community_id = c.community_id
ORDER BY c.community_name, cm.joined_at;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT s.full_name, c.community_name, cm.role, cm.joined_at
FROM student s
JOIN community_membership cm ON s.student_id = cm.student_id
JOIN community c ON cm.community_id = c.community_id
WHERE s.student_id = 1001
ORDER BY cm.joined_at DESC;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT e.event_id, e.title,
COUNT(er.student_id) AS total_registrations,
COUNT(er.student_id) FILTER (WHERE er.status = 'Confirmed') AS confirmed_registrations,
COUNT(er.student_id) FILTER (WHERE er.status = 'Waitlisted') AS waitlisted_registrations
FROM event e LEFT JOIN event_registration er ON e.event_id = er.event_id
GROUP BY e.event_id, e.title
ORDER BY total_registrations DESC;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT event_id, title, category, event_date, location, organizer
FROM event WHERE event_date >= CURRENT_TIMESTAMP ORDER BY event_date;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT e.title, s.full_name, s.college_email, er.status, er.registered_at
FROM event_registration er
JOIN event e ON er.event_id = e.event_id
JOIN student s ON er.student_id = s.student_id
ORDER BY e.event_date, s.full_name;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT p.project_id, p.title, p.category, p.open_positions,
s.full_name AS project_owner, s.department
FROM project p JOIN student s ON p.owner_id = s.student_id
ORDER BY p.created_at DESC;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT p.project_id, p.title, p.category, ps.skill_name, p.open_positions
FROM project p JOIN project_skill ps ON p.project_id = ps.project_id
WHERE LOWER(ps.skill_name) = LOWER('PostgreSQL')
ORDER BY p.title;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT p.title AS project_title, s.full_name AS member_name,
pm.member_role, pm.joined_at
FROM project_member pm
JOIN project p ON pm.project_id = p.project_id
JOIN student s ON pm.student_id = s.student_id
ORDER BY p.title, pm.joined_at;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT s.student_id, s.full_name, s.department
FROM student s
WHERE NOT EXISTS (
SELECT 1 FROM community_membership cm
WHERE cm.student_id = s.student_id
)
ORDER BY s.full_name;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT s.student_id, s.full_name, s.college_email
FROM student s
WHERE NOT EXISTS (
SELECT 1 FROM event_registration er
WHERE er.student_id = s.student_id
)
ORDER BY s.full_name;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT c.community_id, c.community_name,
COUNT(cm.student_id) AS total_members
FROM community c JOIN community_membership cm
ON c.community_id = cm.community_id
GROUP BY c.community_id, c.community_name
HAVING COUNT(cm.student_id) > 1
ORDER BY total_members DESC;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT c.community_name, COUNT(cm.student_id) AS total_members
FROM community c LEFT JOIN community_membership cm
ON c.community_id = cm.community_id
GROUP BY c.community_id, c.community_name
ORDER BY total_members DESC, c.community_name
LIMIT 3;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT p.project_id, p.title, p.open_positions,
COUNT(pm.student_id) AS current_members
FROM project p LEFT JOIN project_member pm
ON p.project_id = pm.project_id
WHERE p.open_positions > 0
GROUP BY p.project_id, p.title, p.open_positions
ORDER BY p.open_positions DESC;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
WITH community_counts AS (
SELECT student_id, COUNT(*) AS communities_joined
FROM community_membership GROUP BY student_id
),
event_counts AS (
SELECT student_id, COUNT(*) AS events_registered
FROM event_registration WHERE status <> 'Cancelled'
GROUP BY student_id
),
project_counts AS (
SELECT student_id, COUNT(*) AS projects_joined
FROM project_member GROUP BY student_id
)
SELECT s.student_id, s.full_name,
COALESCE(cc.communities_joined, 0),
COALESCE(ec.events_registered, 0),
COALESCE(pc.projects_joined, 0)
FROM student s
LEFT JOIN community_counts cc ON s.student_id = cc.student_id
LEFT JOIN event_counts ec ON s.student_id = ec.student_id
LEFT JOIN project_counts pc ON s.student_id = pc.student_id
ORDER BY s.student_id;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT category, COUNT(*) AS total_communities
FROM community GROUP BY category
ORDER BY total_communities DESC, category;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT DATE_TRUNC('month', event_date) AS event_month,
COUNT(*) AS total_events
FROM event GROUP BY DATE_TRUNC('month', event_date)
ORDER BY event_month;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
WITH participation AS (
SELECT s.student_id, s.full_name,
(
SELECT COUNT(*) FROM community_membership cm
WHERE cm.student_id = s.student_id
) +
(
SELECT COUNT(*) FROM event_registration er
WHERE er.student_id = s.student_id AND er.status <> 'Cancelled'
) +
(
SELECT COUNT(*) FROM project_member pm
WHERE pm.student_id = s.student_id
) AS participation_score
FROM student s
)
SELECT student_id, full_name, participation_score,
DENSE_RANK() OVER (ORDER BY participation_score DESC) AS participation_rank
FROM participation
ORDER BY participation_rank, full_name;
