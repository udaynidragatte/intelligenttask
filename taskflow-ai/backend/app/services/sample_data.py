"""Sample tasks inserted once, when the SQLite database is created."""

from __future__ import annotations

from datetime import date, timedelta

from ..database import db
from ..models import Task, utcnow

SAMPLE_TASKS = [
    {
        "title": "Complete Python Assignment",
        "description": "Finish the file-handling and OOP exercises, then upload the notebook.",
        "priority": "High",
        "day_offset": 1,
        "duration": 120,
        "category": "Academics",
        "status": "Pending",
    },
    {
        "title": "Prepare for CN Exam",
        "description": "Revise the transport layer, TCP/IP stack and subnetting numericals.",
        "priority": "Critical",
        "day_offset": 2,
        "duration": 180,
        "category": "Exams",
        "status": "Pending",
    },
    {
        "title": "Submit Project Report",
        "description": "Add the algorithm analysis chapter and get the report spiral bound.",
        "priority": "Critical",
        "day_offset": 0,
        "duration": 90,
        "category": "Academics",
        "status": "In Progress",
    },
    {
        "title": "Practice DSA Problems",
        "description": "Solve five array and heap problems on the practice sheet.",
        "priority": "Medium",
        "day_offset": 4,
        "duration": 60,
        "category": "Practice",
        "status": "Pending",
    },
    {
        "title": "Complete React Application",
        "description": "Wire the dashboard to the Flask API and finish the responsive layout.",
        "priority": "High",
        "day_offset": 6,
        "duration": 240,
        "category": "Projects",
        "status": "Pending",
    },
    {
        "title": "Prepare Presentation",
        "description": "Build 12 slides covering arrays, lists, stacks, queues and heaps.",
        "priority": "Medium",
        "day_offset": 3,
        "duration": 75,
        "category": "Projects",
        "status": "Pending",
    },
    {
        "title": "Revise Operating Systems",
        "description": "Go through scheduling algorithms and deadlock detection notes.",
        "priority": "Low",
        "day_offset": 7,
        "duration": 90,
        "category": "Exams",
        "status": "Pending",
    },
    {
        "title": "Update Resume and Portfolio",
        "description": "Add the TaskFlow AI project with screenshots and the GitHub link.",
        "priority": "Low",
        "day_offset": 10,
        "duration": 45,
        "category": "Personal",
        "status": "Pending",
    },
    {
        "title": "Write Team Standup Notes",
        "description": "Summarise yesterday's blockers and today's plan for the project team.",
        "priority": "Low",
        "day_offset": 0,
        "duration": 20,
        "category": "Work",
        "status": "Completed",
        "completed_hours_ago": 3,
    },
    {
        "title": "DBMS Assignment Submission",
        "description": "Normalise the given schema to 3NF and submit the ER diagram.",
        "priority": "High",
        "day_offset": -1,
        "duration": 60,
        "category": "Academics",
        "status": "Pending",
    },
    {
        "title": "Read Research Paper on Heaps",
        "description": "Summarise the applications of binary heaps in scheduling systems.",
        "priority": "Medium",
        "day_offset": 5,
        "duration": 50,
        "category": "Research",
        "status": "Completed",
        "completed_days_ago": 2,
    },
    {
        "title": "Weekly Progress Review",
        "description": "Compare planned versus completed tasks and update the project tracker.",
        "priority": "Medium",
        "day_offset": -2,
        "duration": 30,
        "category": "Work",
        "status": "Completed",
        "completed_days_ago": 4,
    },
    {
        "title": "Submit OS Lab File",
        "description": "Print the shell scripting lab record and submit it to the lab in-charge.",
        "priority": "Medium",
        "day_offset": -2,
        "duration": 40,
        "category": "Academics",
        "status": "Completed",
        "completed_days_ago": 6,
    },
    {
        "title": "Prepare DSA Viva Notes",
        "description": "Write one-line definitions and complexities for every data structure.",
        "priority": "Critical",
        "day_offset": 1,
        "duration": 45,
        "category": "Exams",
        "status": "Pending",
    },
]


def seed_database() -> None:
    """Insert realistic sample data only when the table is empty."""

    if Task.query.count() > 0:
        return

    now = utcnow()
    today = date.today()
    created = []

    for index, sample in enumerate(SAMPLE_TASKS):
        task = Task(
            title=sample["title"],
            description=sample["description"],
            priority=sample["priority"],
            deadline=today + timedelta(days=sample["day_offset"]),
            duration=sample["duration"],
            category=sample["category"],
            status=sample["status"],
            created_at=now - timedelta(days=7 - (index % 7)),
        )

        if sample["status"] == "Completed":
            if "completed_hours_ago" in sample:
                task.completed_at = now - timedelta(hours=sample["completed_hours_ago"])
            else:
                task.completed_at = now - timedelta(days=sample.get("completed_days_ago", 1))

        created.append(task)

    db.session.add_all(created)
    db.session.flush()

    # Pre-fill the FIFO execution queue with two pending tasks so the Queue
    # Manager page demonstrates a real queue on first load.
    queued = [task for task in created if task.status == "Pending"][:2]
    for position, task in enumerate(queued, start=1):
        task.queue_position = position

    db.session.commit()
