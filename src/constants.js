import data1 from "./config/data1.json";
import data2 from "./config/data2.json";

const colorArr = ["#A0D8F1", "#A3D9A5", "#D7BDE2", "#F4B7C1", "#F9E79F", "#D3D3D3"];

const list1 = data1.data.items.map((i) => ({
  id: i.id,
  width: i.note_card.cover.width,
  height: i.note_card.cover.height,
  title: i.note_card.display_title,
  author: i.note_card.user.nickname,
}));

const list2 = data2.data.items.map((i) => ({
  id: i.id,
  width: i.note_card.cover.width,
  height: i.note_card.cover.height,
  title: i.note_card.display_title,
  author: i.note_card.user.nickname,
}));

const list = [...list1, ...list2].map((item, index) => ({ bgColor: colorArr[index % (colorArr.length - 1)], ...item }));

export {
  list
}
