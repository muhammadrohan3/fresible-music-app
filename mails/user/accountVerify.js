module.exports = [
  {
    name: "subject",
    value: "Verify Your Email"
  },
  {
    name: "variables",
    children: [
      {
        name: "url",
        value: ["url"]
      }
    ]
  },
  {
    name: "email",
    value: ["user", "email"]
  },
  {
    name: "template",
    value: "accountVerify.ejs"
  }
];
