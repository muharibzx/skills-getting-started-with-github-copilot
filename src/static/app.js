document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  function renderActivities(activities) {
    activitiesList.innerHTML = "";
    activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

    Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = Math.max(details.max_participants - details.participants.length, 0);

        const participantList = details.participants.length
          ? `<div class="participants-list">${details.participants
              .map(
                (email) => `
                  <span class="participant-chip">
                    <span class="participant-email">${email}</span>
                    <button
                      type="button"
                      class="participant-remove"
                      data-activity="${name}"
                      data-email="${email}"
                      aria-label="Remove ${email} from ${name}"
                    >
                      ×
                    </button>
                  </span>
                `
              )
              .join("")}</div>`
          : `<p class="participants-empty">No participants yet — be the first to sign up!</p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <h5>Participants</h5>
            ${participantList}
          </div>
        `;

        activityCard.querySelectorAll(".participant-remove").forEach((button) => {
          button.addEventListener("click", async () => {
            const activityName = button.dataset.activity;
            const participantEmail = button.dataset.email;

            try {
              const response = await fetch(
                `/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(participantEmail)}`,
                {
                  method: "DELETE",
                }
              );

              const result = await response.json();

              if (response.ok) {
                messageDiv.textContent = result.message;
                messageDiv.className = "message success";
                await fetchActivities();
              } else {
                messageDiv.textContent = result.detail || "An error occurred";
                messageDiv.className = "message error";
              }

              messageDiv.classList.remove("hidden");

              setTimeout(() => {
                messageDiv.classList.add("hidden");
              }, 5000);
            } catch (error) {
              messageDiv.textContent = "Failed to unregister participant. Please try again.";
              messageDiv.className = "error";
              messageDiv.classList.remove("hidden");
              console.error("Error unregistering participant:", error);
            }
          });
        });

        activitiesList.appendChild(activityCard);

        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
  }

  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      if (!response.ok) {
        throw new Error("Unable to load activities");
      }

      const activities = await response.json();
      renderActivities(activities);
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "message success";
        signupForm.reset();
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "message error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "message error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
