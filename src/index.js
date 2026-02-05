require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true,
    credentials: true,
  })
);
app.use(express.json());

const courses = [
  {
    _id: "yoga",
    title: "Йога",
    description: "Курс для начинающих",
    suitable: [
      "Давно хотели попробовать йогу, но не решались начать",
      "Хотите укрепить позвоночник, избавиться от болеи в спине и суставах",
      "Ищете активность, полезную для тела и души",
    ],
    directions: [
      "Йога для новичков",
      "Кундалини-йога",
      "Хатха-йога",
      "Классическая йога",
      "Йогатерапия",
      "Аштанга-йога",
    ],
  },
  {
    _id: "stretching",
    title: "Стретчинг",
    description: "Гибкость и растяжка",
    suitable: [
      "Хотите стать гибче и убрать скованность",
      "Нужна разгрузка после сидячеи работы",
      "Хотите улучшить осанку и подвижность",
    ],
    directions: ["Мягкая растяжка", "Суставная гимнастика", "Стретчинг для начинающих"],
  },
  {
    _id: "fitness",
    title: "Фитнес",
    description: "Тренировки дома",
    suitable: [
      "Хотите привести тело в тонус",
      "Нужны простые тренировки без зала",
      "Хотите улучшить выносливость",
    ],
    directions: ["Кардио", "Функциональные", "Общая физподготовка"],
  },
  {
    _id: "stepaerobics",
    title: "Степ-аэробика",
    description: "Кардио тренировки",
    suitable: [
      "Любите динамичные тренировки",
      "Хотите больше кардио и сжечь калории",
      "Нравится тренироваться под ритм",
    ],
    directions: ["Базовые шаги", "Комбинации", "Интенсив"],
  },
  {
    _id: "bodyflex",
    title: "Бодифлекс",
    description: "Дыхание и фигура",
    suitable: [
      "Хотите мягкие тренировки",
      "Интересует дыхательная техника",
      "Нужно подтянуть фигуру без ударных нагрузок",
    ],
    directions: ["Дыхание", "Тонус", "Комплекс на тело"],
  },
];

app.get("/api/fitness", (req, res) => {
  res.json({ message: "SkyFitnessPro API is running" });
});

app.get("/api/fitness/courses", (req, res) => {
  res.json(courses.map(({ suitable, directions, ...rest }) => rest));
});

app.get("/api/fitness/courses/:id", (req, res) => {
  const course = courses.find((c) => c._id === req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });
  res.json(course);
});

const PORT = process.env.PORT || 3001;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {})
  .catch(() => {});

app.listen(PORT);
