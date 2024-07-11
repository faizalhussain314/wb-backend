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
      console.log(`Element with selector "${selector}" not found.`);
      return;
    }
    console.log("Updating element", element);
    // Remove the word "data" from the content
    const cleanedContent = content.replace(/data:/g, "");
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

  // Function to automatically scroll to a specific element
  function autoScrollToSelector(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      console.log(`Element with selector "${selector}" not found.`);
    }
  }

  // Listen for messages from parent
  window.addEventListener("message", function (event) {
    if (event.data.type === "start") {
      fetchSelectorsList().then((fetchedSelectors) => {
        selectors = fetchedSelectors;
        console.log("Fetched selectors:", selectors);
        fetchStreamedContent();
        if (selectors.length > 0) {
          // Start automatic scrolling to the first selector
          autoScrollToSelector(selectors[0]);
        }
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



//below code was working stream content with typing effect

<script>
  document.addEventListener("DOMContentLoaded", function () {
    const API_BASE_URL = "https://dev.gravitywrite.com/api";
    let selectors = [];
    let streamedContent = "";
    let currentIndex = 0;

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
        console.log(`Element with selector "${selector}" not found.`);
        return;
      }
      console.log("Updating element", element);
      // Remove the word "data" from the content
      const cleanedContent = content.replace(/data:/g, "");
      element.textContent = cleanedContent;
    }

    // Function to automatically scroll to a specific element
    function autoScrollToSelector(selector) {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        console.log(`Element with selector "${selector}" not found.`);
      }
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

          function processText({ done, value }) {
            if (done) return;

            streamedContent += decoder.decode(value, { stream: true });
            const contentParts = streamedContent.split(";");

            // First, update all elements with their content
            contentParts.forEach((contentPart, index) => {
              if (index < selectors.length) {
                updateElement(selectors[index], contentPart.trim());
              }
            });

            // Then, handle scrolling sequentially
            if (currentIndex < selectors.length && currentIndex < contentParts.length) {
              updateElement(selectors[currentIndex], contentParts[currentIndex].trim());
              autoScrollToSelector(selectors[currentIndex]);
              currentIndex++;
            }

            // Continue reading the stream
            reader.read().then(processText);
          }

          reader.read().then(processText);
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
          currentIndex = 0; // Reset currentIndex when starting
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
        primaryColor: getComputedStyle(
          document.documentElement
        ).getPropertyValue("--e-global-color-primary").trim(),
        secondaryColor: getComputedStyle(
          document.documentElement
        ).getPropertyValue("--e-global-color-secondary").trim(),
        fontFamily: getComputedStyle(
          document.documentElement
        ).getPropertyValue("--e-global-typography-primary-font-family").trim(),
      };
      window.parent.postMessage(initialStyles, "*");
    };
  });
</script>



<script>
document.addEventListener("DOMContentLoaded", function () {
  const API_BASE_URL = "https://dev.gravitywrite.com/api";
  let selectors = [];
  let streamedContent = "";
  let currentIndex = 0;

  // Fetch selectors list
  function fetchSelectorsList(templateName, pageName) {
    return fetch(`${API_BASE_URL}/ai/builder/getPageSelector?templatename=${templateName}&page=${pageName}`)
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
      console.log(`Element with selector "${selector}" not found.`);
      return;
    }
    console.log("Updating element", element);
    // Remove the word "data" from the content
    const cleanedContent = content.replace(/data:/g, "");
    element.textContent = cleanedContent;
  }

  // Function to automatically scroll to a specific element
  function autoScrollToSelector(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      console.log(`Element with selector "${selector}" not found.`);
    }
  }

  // Fetch and stream content
  function fetchStreamedContent(templateName, pageName) {
    fetch(`${API_BASE_URL}/ai/builder/getPageTemplate?templatename=${templateName}&page=${pageName}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.body.getReader())
      .then((reader) => {
        const decoder = new TextDecoder("utf-8");

        function processText({ done, value }) {
          if (done) {
            window.parent.postMessage({ type: "generationStatus", isGenerating: false }, "*");
            return;
          }

          streamedContent += decoder.decode(value, { stream: true });
          const contentParts = streamedContent.split(";");

          // First, update all elements with their content
          contentParts.forEach((contentPart, index) => {
            if (index < selectors.length) {
              updateElement(selectors[index], contentPart.trim());
            }
          });

          // Then, handle scrolling sequentially
          if (currentIndex < selectors.length && currentIndex < contentParts.length) {
            updateElement(selectors[currentIndex], contentParts[currentIndex].trim());
            autoScrollToSelector(selectors[currentIndex]);
            currentIndex++;
          }

          // Notify parent that generation is in progress
          window.parent.postMessage({ type: "generationStatus", isGenerating: true }, "*");

          // Continue reading the stream
          reader.read().then(processText);
        }

        reader.read().then(processText);
      })
      .catch((error) => {
        console.error("Error fetching streaming content:", error);
      });
  }

  // Listen for messages from parent
  window.addEventListener("message", function (event) {
    if (event.data.type === "start") {
      const { templateName, pageName } = event.data;
      fetchSelectorsList(templateName, pageName).then((fetchedSelectors) => {
        selectors = fetchedSelectors;
        console.log("Fetched selectors:", selectors);
        currentIndex = 0; // Reset currentIndex when starting
        fetchStreamedContent(templateName, pageName);
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
      primaryColor: getComputedStyle(
        document.documentElement
      ).getPropertyValue("--e-global-color-primary").trim(),
      secondaryColor: getComputedStyle(
        document.documentElement
      ).getPropertyValue("--e-global-color-secondary").trim(),
      fontFamily: getComputedStyle(
        document.documentElement
      ).getPropertyValue("--e-global-typography-primary-font-family").trim(),
    };
    window.parent.postMessage(initialStyles, "*");
  };
});
</script>





<script>
document.addEventListener("DOMContentLoaded", function () {
  const API_BASE_URL = "https://dev.gravitywrite.com/api";
  let selectors = [];
  let streamedContent = "";
  let currentIndex = 0;
  let generatedContent = {};
  let isFetching = false; // Flag to prevent multiple fetch calls

  // Fetch selectors list
  function fetchSelectorsList(templateName, pageName) {
    if (isFetching) return; // Prevent multiple fetch calls
    isFetching = true;
    return fetch(`${API_BASE_URL}/ai/builder/getPageSelector?templatename=${templateName}&page=${pageName}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("data's value", data);
        isFetching = false; // Reset fetching flag
        return data.map((selector) => selector.trim());
      })
      .catch((error) => {
        console.error("Error fetching selectors:", error);
        isFetching = false; // Reset fetching flag
        return [];
      });
  }

  // Function to update element with content
  function updateElement(selector, content) {
    const element = document.querySelector(selector);
    if (!element) {
      console.log(`Element with selector "${selector}" not found.`);
      return;
    }
  
    // Remove the word "data" from the content and also remove newlines
    const cleanedContent = content.replace(/data:/g, "").replace(/\\n/g, "");
	  element.textContent = "";
    element.textContent = cleanedContent;

    // Store the generated content
    generatedContent[selector] = cleanedContent;
  }

  // Function to automatically scroll to a specific element
  function autoScrollToSelector(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      console.log(`Element with selector "${selector}" not found.`);
    }
  }

  // Fetch and stream content
  function fetchStreamedContent(templateName, pageName) {
    if (isFetching) return; // Prevent multiple fetch calls
    isFetching = true;
    fetch(`${API_BASE_URL}/ai/builder/getPageTemplate?templatename=${templateName}&page=${pageName}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.body.getReader())
      .then((reader) => {
        const decoder = new TextDecoder("utf-8");

        function processText({ done, value }) {
          if (done) {
            window.parent.postMessage({ type: "generationStatus", isGenerating: false }, "*");
            window.parent.postMessage({ type: "generatedContent", content: generatedContent, pageName }, "*");
            isFetching = false; // Reset fetching flag
            return;
          }

          streamedContent += decoder.decode(value, { stream: true });
          const contentParts = streamedContent.split(";");

          // First, update all elements with their content
          contentParts.forEach((contentPart, index) => {
            if (index < selectors.length) {
              updateElement(selectors[index], contentPart.trim());
            }
          });

          // Then, handle scrolling sequentially
          if (currentIndex < selectors.length && currentIndex < contentParts.length) {
            updateElement(selectors[currentIndex], contentParts[currentIndex].trim());
            autoScrollToSelector(selectors[currentIndex]);
            currentIndex++;
          }

          // Notify parent that generation is in progress
          window.parent.postMessage({ type: "generationStatus", isGenerating: true }, "*");

          // Continue reading the stream
          reader.read().then(processText);
        }

        reader.read().then(processText);
      })
      .catch((error) => {
        console.error("Error fetching streaming content:", error);
        isFetching = false; // Reset fetching flag
      });
  }

  // Start content generation
  function startContentGeneration(templateName, pageName) {
    fetchSelectorsList(templateName, pageName).then((fetchedSelectors) => {
      selectors = fetchedSelectors;
      console.log("Fetched selectors:", selectors);
      currentIndex = 0; // Reset currentIndex when starting
      generatedContent = {}; // Reset generated content
      fetchStreamedContent(templateName, pageName);
    });
  }

  // Listen for messages from parent
  window.addEventListener("message", function (event) {
    if (event.data.type === "start") {
      const { templateName, pageName } = event.data;
      startContentGeneration(templateName, pageName);
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
	  else{
		  return 
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
      primaryColor: getComputedStyle(
        document.documentElement
      ).getPropertyValue("--e-global-color-primary").trim(),
      secondaryColor: getComputedStyle(
        document.documentElement
      ).getPropertyValue("--e-global-color-secondary").trim(),
      fontFamily: getComputedStyle(
        document.documentElement
      ).getPropertyValue("--e-global-typography-primary-font-family").trim(),
    };
    window.parent.postMessage(initialStyles, "*");
  };
});
</script>
