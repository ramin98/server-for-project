const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(express.static('public'))

function generateRandomId(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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
    orders.push(obj);
    res.json({ text: `Заказ клиента ${obj.customerName} был добавлен` });
  } catch (error) {
    res.status(500).json({ text: "Ошибка добавления заказа" });
  }
});

app.delete("/delete-admin/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let item = goods.find((item) => id === item.id);
    if (item) {
      goods = goods.filter((item) => id !== item.id);
      res.json({ text: `Товар ${item.product_name} был удален из товаров` });
    } else {
      res.status(404).json({ text: "Товар не найден" });
    }
  } catch (error) {
    res.status(500).json({ text: "Ошибка удаления товара" });
  }
});

app.post("/add-admin", async (req, res) => {
  try {
    let obj = req.body;
    if (goods.some((item) => item.product_name === obj.product_name)) {
      res.status(400).json({ text: "Этот товар уже есть в массиве", case: false });
    } else {
      let id = generateRandomId(8);
      obj.id = id;
      goods.push(obj);
      res.json({ text: `Товар с именем ${obj.product_name} был добавлен`, id });
    }
  } catch (error) {
    res.status(500).json({ text: "Ошибка добавления товара" });
  }
});

app.put("/change-admin/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let index = goods.findIndex((item) => id === item.id);
    if (index !== -1) {
      goods[index] = { ...req.body, id: goods[index].id };
      res.json({ text: `Товар ${req.body.product_name} был изменен` });
    } else {
      res.status(404).json({ text: "Товар не найден" });
    }
  } catch (error) {
    res.status(500).json({ text: "Ошибка изменения товара" });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
