import { STORE_NAME } from "../constants/constants";

export const gotoOrder = (id) => {
  if (id) {
    let orderId = id.split("gid://shopify/Order/").at(1);
    let url = `https://admin.shopify.com/store/${STORE_NAME}/orders/`;
    window.open(url + orderId, "_blank");
  } else {
    console.log("id is not defined");
  }
};
