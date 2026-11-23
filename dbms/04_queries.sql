-- ============================================================
-- SocioFy - CP3: SQL Queries
-- Database: PostgreSQL
-- Based on: dbms/03_schema.sql
-- ============================================================

-- Q01. Display all verified students in a department.
SELECT student_id, full_name, college_email, department, academic_year
FROM student
WHERE department = 'Computer Science'
  AND is_verified = TRUE
ORDER BY full_name;


-- Q02. Count students in each department.
SELECT department, COUNT(*) AS total_students
FROM student
GROUP BY department
ORDER BY total_students DESC, department;


-- Q03. Display communities with their total member counts.
SELECT c.community_id, c.community_name, c.category,
       COUNT(cm.student_id) AS total_members
FROM community c
LEFT JOIN community_membership cm
    ON c.community_id = cm.community_id
GROUP BY c.community_id, c.community_name, c.category
ORDER BY total_members DESC;


-- Q04. Display each community member with their role.
SELECT c.community_name, s.full_name, s.department,
       cm.role, cm.joined_at
FROM community_membership cm
JOIN student s ON cm.student_id = s.student_id
JOIN community c ON cm.community_id = c.community_id
ORDER BY c.community_name, cm.joined_at;


-- Q05. Find all communities joined by a particular student.
SELECT s.full_name, c.community_name, cm.role, cm.joined_at
FROM student s
JOIN community_membership cm ON s.student_id = cm.student_id
JOIN community c ON cm.community_id = c.community_id
WHERE s.student_id = 1001
ORDER BY cm.joined_at DESC;


-- Q06. Display events with registration counts by status.
SELECT e.event_id, e.title,
       COUNT(er.student_id) AS total_registrations,
       COUNT(er.student_id) FILTER (WHERE er.status = 'Confirmed')
           AS confirmed_registrations,
       COUNT(er.student_id) FILTER (WHERE er.status = 'Waitlisted')
           AS waitlisted_registrations
FROM event e
LEFT JOIN event_registration er ON e.event_id = er.event_id
GROUP BY e.event_id, e.title
ORDER BY total_registrations DESC;


-- Q07. Find upcoming events.
SELECT event_id, title, category, event_date, location, organizer
FROM event
WHERE event_date >= CURRENT_TIMESTAMP
ORDER BY event_date;


-- Q08. Display registered students for each event.
SELECT e.title, s.full_name, s.college_email,
       er.status, er.registered_at
FROM event_registration er
JOIN event e ON er.event_id = e.event_id
JOIN student s ON er.student_id = s.student_id
ORDER BY e.event_date, s.full_name;


-- Q09. Display projects along with their owners.
SELECT p.project_id, p.title, p.category,
       p.open_positions, s.full_name AS project_owner,
       s.department
FROM project p
JOIN student s ON p.owner_id = s.student_id
ORDER BY p.created_at DESC;


-- Q10. Find projects requiring a particular skill.
SELECT p.project_id, p.title, p.category,
       ps.skill_name, p.open_positions
FROM project p
JOIN project_skill ps ON p.project_id = ps.project_id
WHERE LOWER(ps.skill_name) = LOWER('PostgreSQL')
ORDER BY p.title;


-- Q11. Display project members and their roles.
SELECT p.title AS project_title, s.full_name AS member_name,
       pm.member_role, pm.joined_at
FROM project_member pm
JOIN project p ON pm.project_id = p.project_id
JOIN student s ON pm.student_id = s.student_id
ORDER BY p.title, pm.joined_at;


-- Q12. Find students who have not joined any community.
SELECT s.student_id, s.full_name, s.department
FROM student s
WHERE NOT EXISTS (
    SELECT 1
    FROM community_membership cm
    WHERE cm.student_id = s.student_id
)
ORDER BY s.full_name;


-- Q13. Find students who have never registered for an event.
SELECT s.student_id, s.full_name, s.college_email
FROM student s
WHERE NOT EXISTS (
    SELECT 1
    FROM event_registration er
    WHERE er.student_id = s.student_id
)
ORDER BY s.full_name;


-- Q14. Find communities having more than one member.
SELECT c.community_id, c.community_name,
       COUNT(cm.student_id) AS total_members
FROM community c
JOIN community_membership cm
    ON c.community_id = cm.community_id
GROUP BY c.community_id, c.community_name
HAVING COUNT(cm.student_id) > 1
ORDER BY total_members DESC;


-- Q15. Find the top three communities by membership.
SELECT c.community_name,
       COUNT(cm.student_id) AS total_members
FROM community c
LEFT JOIN community_membership cm
    ON c.community_id = cm.community_id
GROUP BY c.community_id, c.community_name
ORDER BY total_members DESC, c.community_name
LIMIT 3;


-- Q16. Display projects with open positions and member counts.
SELECT p.project_id, p.title, p.open_positions,
       COUNT(pm.student_id) AS current_members
FROM project p
LEFT JOIN project_member pm ON p.project_id = pm.project_id
WHERE p.open_positions > 0
GROUP BY p.project_id, p.title, p.open_positions
ORDER BY p.open_positions DESC;


-- Q17. Generate a student participation summary.
WITH community_counts AS (
    SELECT student_id, COUNT(*) AS communities_joined
    FROM community_membership
    GROUP BY student_id
),
event_counts AS (
    SELECT student_id, COUNT(*) AS events_registered
    FROM event_registration
    WHERE status <> 'Cancelled'
    GROUP BY student_id
),
project_counts AS (
    SELECT student_id, COUNT(*) AS projects_joined
    FROM project_member
    GROUP BY student_id
)
SELECT s.student_id, s.full_name,
       COALESCE(cc.communities_joined, 0) AS communities_joined,
       COALESCE(ec.events_registered, 0) AS events_registered,
       COALESCE(pc.projects_joined, 0) AS projects_joined
FROM student s
LEFT JOIN community_counts cc ON s.student_id = cc.student_id
LEFT JOIN event_counts ec ON s.student_id = ec.student_id
LEFT JOIN project_counts pc ON s.student_id = pc.student_id
ORDER BY s.student_id;


-- Q18. Count communities in each category.
SELECT category, COUNT(*) AS total_communities
FROM community
GROUP BY category
ORDER BY total_communities DESC, category;


-- Q19. Calculate monthly event statistics.
SELECT DATE_TRUNC('month', event_date) AS event_month,
       COUNT(*) AS total_events
FROM event
GROUP BY DATE_TRUNC('month', event_date)
ORDER BY event_month;


-- Q20. Rank students based on their total participation.
WITH participation AS (
    SELECT s.student_id, s.full_name,
           (
               SELECT COUNT(*)
               FROM community_membership cm
               WHERE cm.student_id = s.student_id
           ) +
           (
               SELECT COUNT(*)
               FROM event_registration er
               WHERE er.student_id = s.student_id
                 AND er.status <> 'Cancelled'
           ) +
           (
               SELECT COUNT(*)
               FROM project_member pm
               WHERE pm.student_id = s.student_id
           ) AS participation_score
    FROM student s
)
SELECT student_id, full_name, participation_score,
       DENSE_RANK() OVER (
           ORDER BY participation_score DESC
       ) AS participation_rank
FROM participation
ORDER BY participation_rank, full_name;

-- ============================================================
-- End of CP3 Queries
-- ============================================================
