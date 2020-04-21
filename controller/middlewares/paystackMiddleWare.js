const {
  PAYSTACK_INITIALIZE,
  PAYSTACK_PARAMS,
  PAYSTACK_RESPONSE,
  PAYSTACK_VERIFY,
} = require("../../constants");
const urlFormer = require("../util/urlFormer");
const handleResponse = require("../util/handleResponse");

const key =
  process.env.NODE_ENV !== "production"
    ? process.env.PAYSTACK_TEST_SECRET
    : process.env.PAYSTACK_SECRET;

const Paystack = require("paystack")(key);

const paystackConstructor = ({ setStore, getStore, req }) => () => {
  try {
    const callback_url = urlFormer("/payment/verify", null, req);
    const { email } = req.user;
    const { id, package } = getStore("paystackKey");
    let { price } = package;
    price = price * 100;
    const metadata = {
      paymentId: id,
    };
    return setStore(PAYSTACK_PARAMS, {
      email,
      callback_url,
      amount: price,
      metadata: JSON.stringify(metadata),
    });
  } catch (e) {
    return handleResponse("error", e);
  }
};

const paystack = ({ setStore, getStore }) => async (type) => {
  // const { transactions } = Paystack;
  const handler = async (fn) => {
    try {
      let params = getStore(PAYSTACK_PARAMS);
      if (!params) return;
      const { reference } = params;
      if (reference) params = reference;
      let response = await fn(params);
      return setStore(PAYSTACK_RESPONSE, response.data);
    } catch (e) {
      return handleResponse("error", e);
    }
  };
  switch (type) {
    case PAYSTACK_INITIALIZE:
      return await handler(Paystack.transaction.initialize);
    case PAYSTACK_VERIFY:
      return await handler(Paystack.transaction.verify);
  }
};

module.exports = { paystackConstructor, paystack };
