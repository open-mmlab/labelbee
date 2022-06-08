import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resources from "./resources.json";

/**
 * 根据是否有language判断为是否初始化
 */
if (!i18n.language) {
  i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
      lng: "en",
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false, //   <---- this will do the magic
      },
    });
}

i18n.addResourceBundle("en", "translation", resources.en, true);
i18n.addResourceBundle("cn", "translation", resources.cn, true);

export default i18n;
export { i18n };
