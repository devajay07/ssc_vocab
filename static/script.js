let correctAnswer = "";
let options = [];
let score = 0;
let questionsAsked = 0;

// Function to load the next question
function nextQuestion() {
  document.getElementById("feedback").textContent = ""; // Reset feedback

  fetch("/get_question")
    .then((response) => response.json())
    .then((data) => {
      // Update the question
      document.getElementById("question-text").textContent = data.question;

      // Store the correct answer from the response
      correctAnswer = data.correct_answer; // Use the correct answer from the response
      options = data.options;
      score = data.score;
      questionsAsked = data.questions_asked;

      const optionsContainer = document.getElementById("options-container");
      optionsContainer.innerHTML = ""; // Clear previous options

      options.forEach((option, index) => {
        const optionDiv = document.createElement("div");
        optionDiv.classList.add("option"); // Add class for styling

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `option-${index}`;
        checkbox.value = option;

        const label = document.createElement("label");
        label.htmlFor = `option-${index}`;
        label.textContent = option;

        optionDiv.appendChild(checkbox);
        optionDiv.appendChild(label);
        optionsContainer.appendChild(optionDiv); // Append the option div
      });

      // Update score display
      document.getElementById(
        "score-text"
      ).textContent = `Score: ${score} / ${questionsAsked}`;
    })
    .catch((error) => {
      console.error(error);
    });
}

// Function to check the selected answer
function checkAnswer() {
  const selectedAnswers = document.querySelectorAll(
    'input[type="checkbox"]:checked'
  );

  // Ensure only one answer is selected
  if (selectedAnswers.length === 0) {
    document.getElementById("feedback").textContent =
      "Please select an answer.";
    document.getElementById("feedback").style.color = "black"; // Default color
    return;
  } else if (selectedAnswers.length > 1) {
    document.getElementById("feedback").textContent =
      "Please select only one answer.";
    document.getElementById("feedback").style.color = "black"; // Default color
    return;
  }

  const selectedAnswer = selectedAnswers[0].value; // Get the first (and only) checked answer

  // Submit the selected answer
  fetch(`/submit_answer/${selectedAnswer}`, {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Response Data:", data); // Log the response from the server
      if (data.result === "correct") {
        document.getElementById("feedback").textContent = "Correct!";
        document.getElementById("feedback").style.color = "green"; // Default color
        setTimeout(nextQuestion, 700);
      } else {
        document.getElementById(
          "feedback"
        ).textContent = `Wrong! The correct answer is: ${data.correct_answer}`;
        document.getElementById("feedback").style.color = "red"; // Default color
        setTimeout(nextQuestion, 3000);
      }

      // Update score display
      document.getElementById(
        "score-text"
      ).textContent = `Score: ${data.score} / ${questionsAsked}`;

      // Load the next question after a short delay to allow the user to see feedback
    })
    .catch((error) => {
      console.error("Fetch Error:", error); // Log any errors
    });
}

// Function to reset the score
function resetScore() {
  fetch("/reset_score", { method: "POST" })
    .then((response) => response.json())
    .then((data) => {
      score = 0; // Reset local score
      questionsAsked = 0; // Reset questions asked
      document.getElementById(
        "score-text"
      ).textContent = `Score: ${score} / ${questionsAsked}`;
      document.getElementById("feedback").textContent = "Score has been reset!";
    })
    .catch((error) => {
      console.error("Error resetting score:", error);
    });
}

// Function to update the target number of questions
function updateTarget() {
  const newTarget = document.getElementById("new-target").value;

  // Validate the input
  if (!newTarget || newTarget <= 0) {
    document.getElementById("feedback").textContent =
      "Please enter a valid target.";
    return;
  }

  // Send a request to update the target on the server
  fetch(`/update_target/${newTarget}`, {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("feedback").textContent = data.message;
      document.getElementById("new-target").value = ""; // Clear the input field
    })
    .catch((error) => {
      console.error("Error updating target:", error);
    });
}

// Load the first question on page load
window.onload = nextQuestion;
