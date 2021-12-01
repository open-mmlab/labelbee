const i18n = require("i18next");
const { initReactI18next } = require("react-i18next");
const resources = require("./i18n/resources.json");

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

module.exports = {
  i18n,
};
