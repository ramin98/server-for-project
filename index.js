const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const PORT = 5000;
const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Set up storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/photos"); // Directory where files will be saved
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Generate unique file name
  },
});

const upload = multer({ storage });

function generateRandomId(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

let goods = [
  {
    product_name: "Кровать TATRAN",
    product_description:
      "Основание из полированной нержавеющей стали, придает оригинальный парящий эффект.",
    product_price: 120000,
    id: generateRandomId(8),
    url:'http://localhost:5000/photos/photo1.png'
  },
  {
    product_name: "Кресло VILORA",
    product_description:
      "Мягкое и уютное, аккуратное и стильное. Упругие подушки сиденья и приятная на ощупь ткань.",
    product_price: 21000,
    id: generateRandomId(8),
    url:'http://localhost:5000/photos/photo2.png'
  },
  {
    product_name: "Стол MENU",
    product_description:
      "Европейский дуб - отличается особой прочностью и стабильностью.",
    product_price: 34000,
    id: generateRandomId(8),
    url:'http://localhost:5000/photos/photo3.png'
  },
  {
    product_name: "Диван ASKESTA",
    product_description:
      "Благодаря защелкивающемуся механизму диван легко раскладывается в комфортную кровать",
    product_price: 68000,
    id: generateRandomId(8),
    url:'http://localhost:5000/photos/photo4.png'
  },
  {
    product_name: "Кресло LUNAR",
    product_description:
      "Прекрасно переносит солнечные лучи, перепады влажности и любые осадки",
    product_price: 40000,
    id: generateRandomId(8),
    url:'http://localhost:5000/photos/photo5.png'
  },
  {
    product_name: "Шкаф Nastan",
    product_description:
      "Мебель может быть оснащена разнообразными системами подсветки.",
    product_price: 80000,
    id: generateRandomId(8),
    url:'http://localhost:5000/photos/photo6.png'
  },
];

let orders = [];

app.get("/goods", async (req, res) => {
  try {
    res.json(goods);
  } catch (error) {
    res.status(500).json({ text: "Ошибка получения товаров" });
  }
});

app.get("/orders", async (req, res) => {
  try {
    res.json(orders);
  } catch (error) {
    res.status(500).json({ text: "Ошибка получения заказов" });
  }
});

app.post("/add-orders", async (req, res) => {
  try {
    let obj = req.body;
    obj.id = generateRandomId(8);
    orders.push(obj);
    res.json({ text: `Заказ клиента ${obj.customer_name} был добавлен` });
  } catch (error) {
    res.status(500).json({ text: "Ошибка добавления заказа" });
  }
});

app.delete("/delete-admin/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let item = goods.find((item) => id === item.id);
    if (item) {
      // Удаляем фото из файловой системы
      if (item.url) {
        const filePath = path.join(__dirname, "public", "photos", path.basename(item.url));
        fs.unlink(filePath, (err) => {
          if (err) console.error("Ошибка удаления файла:", err);
        });
      }
      goods = goods.filter((item) => id !== item.id);
      res.json({ text: `Товар ${item.product_name} был удален из товаров` });
    } else {
      res.status(404).json({ text: "Товар не найден" });
    }
  } catch (error) {
    res.status(500).json({ text: "Ошибка удаления товара" });
  }
});

// Edit product and change photo
app.put("/change-admin/:id", upload.single("file"), async (req, res) => {
  try {
    let id = req.params.id;
    let index = goods.findIndex((item) => id === item.id);
    if (index !== -1) {
      let oldFileUrl = goods[index].url;
      const updatedData = JSON.parse(req.body.data);
      
      // Handle new file upload
      if (req.file) {
        const newFileUrl = `http://localhost:5000/photos/${req.file.filename}`;
        updatedData.url = newFileUrl;

        // Удаляем старый файл
        if (oldFileUrl) {
          const oldFilePath = path.join(__dirname, "public", "photos", path.basename(oldFileUrl));
          fs.unlink(oldFilePath, (err) => {
            if (err) console.error("Ошибка удаления старого файла:", err);
          });
        }
      } else {
        updatedData.url = oldFileUrl; // Keep the old URL if no file is uploaded
      }

      goods[index] = { ...updatedData, id: goods[index].id };
      res.json({ text: `Товар ${updatedData.product_name} был изменен` });
    } else {
      res.status(404).json({ text: "Товар не найден" });
    }
  } catch (error) {
    res.status(500).json({ text: "Ошибка изменения товара" });
  }
});

app.post("/add-admin", upload.single("file"), async (req, res) => {
  try {
    const obj = JSON.parse(req.body.data);
    if (goods.some((item) => item.product_name === obj.product_name)) {
      res.status(400).json({ text: "Этот товар уже есть в массиве", case: false });
    } else {
      const fileUrl = req.file ? `http://localhost:5000/photos/${req.file.filename}` : null;
      let id = generateRandomId(8);
      const newProduct = { ...obj, id, url: fileUrl };
      goods.push(newProduct);
      res.json({ text: `Товар с именем ${obj.product_name} был добавлен`, id, case: true });
    }
  } catch (error) {
    res.status(500).json({ text: "Ошибка добавления товара" });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
