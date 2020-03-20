module.exports = [
  {
    name: "subject",
    value: "Message Submitted via Form"
  },
  {
    name: "variables",
    children: [
      {
        name: "content",
        value: ["schemaData", "content"]
      },
      {
        name: "subject",
        value: ["schemaData", "subject"]
      },
      {
        name: "email",
        value: ["user", "email"]
      }
    ]
  },
  {
    name: "email",
    value: "music@fresible.com"
  },
  {
    name: "template",
    value: "adminContact.ejs"
  }
];
