const axios = require("axios");
const uuid = require("uuidv4").default;
const urlFormer = require("../util/urlFormer");
const {
  Userpackage,
  Userprofile,
  Package,
  Payment,
} = require("../../database/models");

const TEST_KEY =
  process.env.RAVE_TEST_SECRET_KEY ||
  "FLWSECK_TEST-571ea9169105a4917eba26ea2857d783-X";

const LIVE_KEY =
  process.env.RAVE_LIVE_SECRET_KEY ||
  "FLWSECK-868e9e8c04d67f895354f5920434b0aa-X";

const SECRET_KEY = process.env.NODE_ENV === "production" ? LIVE_KEY : TEST_KEY;

const flutterwave_initiate = ({ getStore, setStore, req }) => async () => {
  const { schemaResult } = getStore();
  const { id: userId, firstName, lastName, email } = req.user;
  const { stageName, phone } = await Userprofile.findOne({ where: { userId } });
  const { id: paymentId } = schemaResult;
  const {
    package: { price },
  } = getStore("flutterwave");
  const reference = uuid();
  console.log(getStore("flutterwave"));
  const payload = {
    tx_ref: reference,
    amount: price,
    currency: "NGN",
    payment_options: "card",
    redirect_url: urlFormer("/payment/rave/verify", null, req),
    customer: {
      id: userId,
      email,
      name: firstName + " " + lastName,
      phonenumber: phone,
      stage_name: stageName,
    },
    meta: {
      id: paymentId,
    },
  };

  try {
    const { data } = await axios({
      url: "https://api.flutterwave.com/v3/payments",
      data: payload,
      method: "POST",
      headers: {
        Authorization: `Bearer ${SECRET_KEY}`,
      },
    });
    return setStore("RAVE_RESPONSE", { reference, link: data.data.link });
  } catch (err) {
    return setStore("RAVE_RESPONSE", false);
  }
};

const flutterwave_verify = ({ getStore, setStore, req }) => async () => {
  const { tx_ref: reference, transaction_id } = req.query;
  if (Number.isNaN(Number(transaction_id))) {
    return setStore("RAVE_RESPONSE", false);
  }
  try {
    const {
      data: { status: responseStatus, data },
    } = await axios({
      url: `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      headers: {
        Authorization: `Bearer ${SECRET_KEY}`,
      },
    });

    const { tx_ref, amount, currency, status, meta, created_at } = data;
    setStore("schemaQuery", { id: meta.id });
    if (status === "successful") {
      const payment = await Payment.findByPk(meta.id, {
        include: [
          {
            model: Userpackage,
            as: "subscription",
            include: [{ model: Package, as: "package" }],
          },
        ],
      });
      const txnSuccessful =
        currency === "NGN" &&
        tx_ref === payment.reference &&
        amount >= payment.subscription.package.price;
      if (txnSuccessful) {
        return setStore("RAVE_RESPONSE", {
          status: "success",
          paidAt: created_at,
        });
      }
    }
    return setStore("RAVE_RESPONSE", false);
  } catch (err) {
    await Payment.up;
    return setStore("RAVE_RESPONSE", false);
  }
};

module.exports = { flutterwave_initiate, flutterwave_verify };
