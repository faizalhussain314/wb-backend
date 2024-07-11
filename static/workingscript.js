document.addEventListener("DOMContentLoaded", function () {
  const API_BASE_URL = "https://dev.gravitywrite.com/api";
  let selectors = [];
  let streamedContent = "";

  // Fetch selectors list
  function fetchSelectorsList() {
    return fetch(`${API_BASE_URL}/ai/builder/getSecondSelector`)
      .then((response) => response.json())
      .then((data) => {
        console.log("data's value", data);
        return data.map((selector) => selector.trim());
      })
      .catch((error) => {
        console.error("Error fetching selectors:", error);
        return [];
      });
  }

  // Function to update element with content
  function updateElement(selector, content) {
    const element = document.querySelector(selector);
    if (!element) {
      console.log(`Element with ID "${selector}" not found.`);
      return;
    }
    console.log("Updating element", element);
    // Remove the word "data" from the content
    const cleanedContent = content.replace(/data:/g, "");
    element.textContent = "";
    element.textContent = cleanedContent;
  }

  // Fetch and stream content
  function fetchStreamedContent() {
    fetch(`${API_BASE_URL}/ai/builder/secondStreamed`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.body.getReader())
      .then((reader) => {
        const decoder = new TextDecoder("utf-8");
        reader.read().then(function processText({ done, value }) {
          if (done) return;
          streamedContent += decoder.decode(value, { stream: true });
          const contentParts = streamedContent.split(";");

          // Update elements with content
          contentParts.forEach((contentPart, index) => {
            if (index < selectors.length) {
              updateElement(selectors[index], contentPart.trim());
            }
          });

          // Continue reading the stream
          return reader.read().then(processText);
        });
      })
      .catch((error) => {
        console.error("Error fetching streaming content:", error);
      });
  }

  // Listen for messages from parent
  window.addEventListener("message", function (event) {
    if (event.data.type === "start") {
      fetchSelectorsList().then((fetchedSelectors) => {
        selectors = fetchedSelectors;
        console.log("Fetched selectors:", selectors);
        fetchStreamedContent();
      });
    } else if (event.data.type === "changeFont") {
      const link = document.createElement("link");
      link.href = `https://fonts.googleapis.com/css2?family=${event.data.font.replace(
        / /g,
        "+"
      )}&display=swap`;
      link.rel = "stylesheet";
      document.head.appendChild(link);
      document.body.style.fontFamily = event.data.font;

      document.body.setAttribute(
        "style",
        `font-family: ${event.data.font} !important;`
      );
    }
  });

  function updateCSSVariable(variable, value) {
    for (let sheet of document.styleSheets) {
      try {
        for (let rule of sheet.cssRules || sheet.rules) {
          if (rule.style && rule.style.getPropertyValue(variable)) {
            rule.style.setProperty(variable, value);
            return true;
          }
        }
      } catch (e) {
        continue;
      }
    }
    return false;
  }

  window.addEventListener("message", (event) => {
    if (event.data.type === "changeFont") {
      console.log("Font change event triggered");

      const primaryFontFamilyUpdated = updateCSSVariable(
        "--e-global-typography-primary-font-family",
        event.data.font
      );
      if (primaryFontFamilyUpdated) {
        console.log("Primary font family updated to:", event.data.font);
      } else {
        console.log("Primary font family variable not found.");
      }

      document.documentElement.style.setProperty(
        "--gw-primary-font",
        `${event.data.font} !important`
      );
    } else if (event.data.type === "changeGlobalColors") {
      console.log("Color change event triggered");

      const primaryColorUpdated = updateCSSVariable(
        "--e-global-color-primary",
        event.data.primaryColor
      );
      if (primaryColorUpdated) {
        console.log("Primary color updated to:", event.data.primaryColor);
      } else {
        console.log("Primary color variable not found.");
      }

      const secondaryColorUpdated = updateCSSVariable(
        "--e-global-color-secondary",
        event.data.secondaryColor
      );
      if (secondaryColorUpdated) {
        console.log("Secondary color updated to:", event.data.secondaryColor);
      } else {
        console.log("Secondary color variable not found.");
      }

      document.documentElement.style.setProperty(
        "--e-global-color-primary",
        `${event.data.primaryColor} !important`
      );
      document.documentElement.style.setProperty(
        "--e-global-color-secondary",
        `${event.data.secondaryColor} !important`
      );
    }
  });

  window.onload = function () {
    const initialStyles = {
      type: "initialStyles",
      primaryColor: getComputedStyle(document.documentElement)
        .getPropertyValue("--e-global-color-primary")
        .trim(),
      secondaryColor: getComputedStyle(document.documentElement)
        .getPropertyValue("--e-global-color-secondary")
        .trim(),
      fontFamily: getComputedStyle(document.documentElement)
        .getPropertyValue("--e-global-typography-primary-font-family")
        .trim(),
    };

    window.parent.postMessage(initialStyles, "*");
  };
});
