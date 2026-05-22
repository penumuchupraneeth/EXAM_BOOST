const express = require("express");
const router = express.Router();

const quizData = {
  dsa: [
    { question: "Binary search complexity?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], answer: "O(log n)" },
    { question: "FIFO structure?", options: ["Stack", "Queue", "Tree", "Graph"], answer: "Queue" },
    { question: "LIFO structure?", options: ["Queue", "Stack", "Heap", "Graph"], answer: "Stack" },
    { question: "Fastest average sort?", options: ["Bubble", "Quick", "Selection", "Insertion"], answer: "Quick" },
    { question: "Used in recursion?", options: ["Queue", "Stack", "Array", "Graph"], answer: "Stack" },
    { question: "Quick sort worst?", options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], answer: "O(n²)" }
  ],

  os: [
    { question: "CPU scheduling type?", options: ["FCFS", "SJF", "RR", "All"], answer: "All" },
    { question: "Deadlock condition?", options: ["Mutual Exclusion", "Hold & Wait", "No Preemption", "All"], answer: "All" },
    { question: "Process state?", options: ["Ready", "Running", "Waiting", "All"], answer: "All" },
    { question: "RR uses?", options: ["Time quantum", "Priority", "FIFO", "None"], answer: "Time quantum" },
    { question: "Paging avoids?", options: ["Fragmentation", "Deadlock", "CPU idle", "None"], answer: "Fragmentation" },
    { question: "Kernel is?", options: ["OS core", "App", "Driver", "Compiler"], answer: "OS core" }
  ],

  dbms: [
    { question: "Primary key?", options: ["Unique", "Duplicate", "Null", "None"], answer: "Unique" },
    { question: "SQL stands for?", options: ["Structured Query Language", "Simple Query Lang", "System Query", "None"], answer: "Structured Query Language" },
    { question: "Normalization removes?", options: ["Redundancy", "Tables", "Keys", "Indexes"], answer: "Redundancy" },
    { question: "JOIN is used for?", options: ["Combining tables", "Deleting", "Sorting", "None"], answer: "Combining tables" },
    { question: "Foreign key?", options: ["Reference", "Primary", "Unique", "Null"], answer: "Reference" },
    { question: "DBMS example?", options: ["MySQL", "Windows", "Linux", "Chrome"], answer: "MySQL" }
  ]
};
router.get("/:subject", (req, res) => {
  const subject = req.params.subject;
  const questions = quizData[subject] || [];

  // Shuffle questions randomly
  const shuffled = questions.sort(() => 0.5 - Math.random());

  // Take only 6
  const selected = shuffled.slice(0, 6);

  res.json({ questions: selected });
});

router.post("/submit", (req, res) => {

  try {

    const { answers, questions } = req.body;

    console.log(req.body);

    let score = 0;

    if (!questions || !answers) {

      return res.status(400).json({
        error: "Missing questions or answers"
      });

    }

    questions.forEach((q, i) => {

      if (
        q.answer &&
        answers[i] &&
        String(answers[i]).trim() === String(q.answer).trim()
      ) {
        score++;
      }

    });

    const percent = (score / questions.length) * 100;

    res.json({
      score,
      percent,
      passed: percent >= 60
    });

  } catch (err) {

    console.log("QUIZ ERROR:", err);

    res.status(500).json({
      error: "Quiz evaluation failed"
    });
  }
});
module.exports = router;