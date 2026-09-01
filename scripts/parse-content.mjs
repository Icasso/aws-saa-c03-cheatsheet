#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "web", "src", "data");

function stripBold(text) {
  return text.replace(/\*\*/g, "").trim();
}

function parseFlashcards(content) {
  const cards = [];
  let category = "General";

  for (const line of content.split("\n")) {
    const h2 = line.match(/^## (.+)/);
    if (h2) {
      category = h2[1].trim();
      continue;
    }
    const card = line.match(/^- \*\*(.+?)\*\* — (.+)$/);
    if (card) {
      cards.push({ term: card[1].trim(), definition: card[2].trim(), category });
    }
  }
  return cards;
}

function isMetadataLine(line) {
  const trimmed = line.trim();
  return (
    /^\[Select all that apply\.\]/i.test(trimmed) ||
    trimmed === "[M]" ||
    trimmed === "---"
  );
}

function stripDomainPrefix(line) {
  return line.replace(/^\s*\[[^\]]+\]\s*/, "").trim();
}

function parsePracticeExam(content) {
  const questionsSection = content.split("## QUESTIONS")[1]?.split("# ANSWER KEY")[0] ?? "";
  const answerSection = content.split("# ANSWER KEY")[1] ?? "";

  const answers = new Map();
  const explanations = new Map();

  for (const line of answerSection.split("\n")) {
    const row = line.match(/^\|\s*(\d+)\s*\|\s*\*\*([^*|]+)\*\*\s*\|\s*(.+?)\s*\|$/);
    if (row) {
      const id = Number(row[1]);
      const letters = row[2]
        .split(/[,/]/)
        .map((s) => s.trim().replace(/\*\*/g, ""))
        .filter((s) => /^[A-Z]$/.test(s));
      answers.set(id, letters);
      explanations.set(id, stripBold(row[3]));
    }
  }

  const questions = [];
  const blocks = questionsSection.split(/\n\*\*Q(\d+)\./).slice(1);

  for (let i = 0; i < blocks.length; i += 2) {
    const id = Number(blocks[i]);
    const body = blocks[i + 1] ?? "";

    const domainMatch = body.match(/^\s*\[([^\]]+)\]/);
    const domain = domainMatch ? domainMatch[1] : "General";
    const correct = answers.get(id) ?? [];
    const multiSelect = /\[M\]/.test(body) || correct.length > 1;

    const questionLines = [];
    const options = [];

    for (const line of body.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || isMetadataLine(trimmed)) continue;

      const opt = trimmed.match(/^- ([A-Z])\.\s+(.+)$/);
      if (opt) {
        options.push({ letter: opt[1], text: stripBold(opt[2]) });
        continue;
      }

      const questionPart = stripDomainPrefix(trimmed);
      if (questionPart) {
        questionLines.push(questionPart);
      }
    }

    const questionText = stripBold(
      questionLines
        .join(" ")
        .replace(/\[Select all that apply\.\]\s*\[M\]/gi, "")
        .replace(/\[M\]/g, "")
        .replace(/\s*---+\s*$/g, "")
        .trim()
    );

    questions.push({
      id,
      domain,
      question: questionText,
      options,
      correct,
      multiSelect,
      explanation: explanations.get(id) ?? "",
    });
  }

  return questions.sort((a, b) => a.id - b.id);
}

function parseStudyGuides() {
  const files = readdirSync(ROOT)
    .filter((f) => f.endsWith(".md") && f !== "README.md" && !f.startsWith("07-practice-exam"))
    .sort();

  return files.map((filename) => {
    const content = readFileSync(join(ROOT, filename), "utf8");
    const titleMatch = content.match(/^#\s+(.+)/m);
    const slug = filename.replace(/^\d+-/, "").replace(/\.md$/, "");
    const order = Number(filename.match(/^(\d+)/)?.[1] ?? 99);

    return {
      id: slug,
      filename,
      title: titleMatch ? stripBold(titleMatch[1]) : slug,
      order,
      content,
    };
  });
}

function parseDomains(readme) {
  const domains = [];
  const tableSection = readme.split("## Domain Weightings")[1]?.split("##")[0] ?? "";
  for (const line of tableSection.split("\n")) {
    const row = line.match(/^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*\*\*(\d+)%\*\*/);
    if (row) {
      domains.push({ number: Number(row[1]), name: row[2].trim(), weight: Number(row[3]) });
    }
  }
  return domains;
}

function parseTopTen(readme) {
  const section = readme.split('## The "if you only remember 10 things" list')[1]?.split("##")[0] ?? "";
  const items = [];
  for (const line of section.split("\n")) {
    const numbered = line.match(/^\d+\.\s+(.+)$/);
    if (!numbered) continue;
    const rest = numbered[1];

    let m = rest.match(/^\*\*(.+?)\*\*\s*(?:—|=|:)\s*(.+)$/);
    if (m) {
      items.push({ title: m[1], detail: m[2] });
      continue;
    }

    m = rest.match(/^\*\*(.+?):\*\*\s*(.+)$/);
    if (m) {
      items.push({ title: m[1], detail: m[2] });
      continue;
    }

    m = rest.match(/^\*\*(.+?)\*\*(.*?)\s*—\s*(.+)$/);
    if (m) {
      items.push({ title: (m[1] + m[2]).trim(), detail: m[3] });
      continue;
    }
  }
  return items;
}

function validateContent(data) {
  const errors = [];

  if (data.questions.length !== 65) {
    errors.push(`Expected 65 questions, got ${data.questions.length}`);
  }
  if (data.flashcards.length < 100) {
    errors.push(`Expected at least 100 flashcards, got ${data.flashcards.length}`);
  }
  if (data.topTen.length !== 10) {
    errors.push(`Expected 10 top-ten items, got ${data.topTen.length}`);
  }

  for (const q of data.questions) {
    if (!q.question) {
      errors.push(`Q${q.id} has empty question text`);
    }
    if (q.correct.length > 1 && !q.multiSelect) {
      errors.push(`Q${q.id} has multiple correct answers but multiSelect is false`);
    }
    if (q.options.length === 0) {
      errors.push(`Q${q.id} has no options`);
    }
  }

  if (errors.length > 0) {
    console.error("Content validation failed:");
    for (const err of errors) console.error(`  - ${err}`);
    process.exit(1);
  }
}

const readme = readFileSync(join(ROOT, "00-README-start-here.md"), "utf8");
const flashcardsRaw = readFileSync(join(ROOT, "08-flashcards-key-terms.md"), "utf8");
const examRaw = readFileSync(join(ROOT, "07-practice-exam.md"), "utf8");

const data = {
  meta: {
    title: "AWS SAA-C03 Study App",
    examCode: "SAA-C03",
    duration: 130,
    questionCount: 65,
    passingScore: 720,
  },
  domains: parseDomains(readme),
  topTen: parseTopTen(readme),
  studyGuides: parseStudyGuides(),
  flashcards: parseFlashcards(flashcardsRaw),
  questions: parsePracticeExam(examRaw),
};

validateContent(data);

writeFileSync(join(OUT, "content.json"), JSON.stringify(data, null, 2));
console.log(`Parsed ${data.studyGuides.length} guides, ${data.flashcards.length} flashcards, ${data.questions.length} questions`);
