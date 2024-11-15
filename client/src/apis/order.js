import axios from "../axios"

export const apiCreateOrderMomo = (data) =>
  axios({
    url: "/order/payment",
    method: "post",
    data,
  })

export const apiCheckStatusTransactionMomo = (data) =>
  axios({
    url: "/order/check-status-transaction",
    method: "post",
    data,
  })
