module.exports = [
  {
    name: "subject",
    value: "Your Account Type has been Changed",
  },
  {
    name: "variables",
    children: [
      {
        name: "firstName",
        value: ["tempKey", "firstName"],
      },
    ],
  },
  {
    name: "email",
    value: ["tempKey", "email"],
  },
  {
    name: "template",
    value: "accountTypeChanged.ejs",
  },
];
