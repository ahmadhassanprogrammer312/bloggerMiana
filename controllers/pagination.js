
      const currentPageInput = document.getElementById("currentPageInput");
      const totalPagesInput = document.getElementById("totalPagesInput");
      const slider = document.getElementById("slider");
      const prevBtn = document.getElementById("preBtn"); // Fixed ID
      const nextBtn = document.getElementById("nextBtn");
    
      let totalPages = parseInt(totalPagesInput.value);
      let currentPage = parseInt(currentPageInput.value);
    
      // Update controls when the current page changes
      function updateControls() {
        currentPageInput.value = currentPage;
        slider.value = currentPage;
        slider.max = totalPages; // Sync slider max with totalPages
        slider.min = 1; // Sync slider max with totalPages
        prevBtn.disabled = currentPage === 1;
        // slider.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
      }
    
      // Sync slider with currentPage input
      slider.addEventListener("input", () => {
        currentPage = parseInt(slider.value);
        updateControls();
      });
    
      // Sync currentPage input with slider
      currentPageInput.addEventListener("input", () => {
        const newPage = parseInt(currentPageInput.value);
        if (newPage >= 1 && newPage <= totalPages) {
          currentPage = newPage;
          updateControls();
        } else {
          currentPageInput.value = currentPage; // Reset to the last valid value
        }
      });
    
      // Adjust slider max when totalPages changes
      totalPagesInput.addEventListener("input", () => {
        totalPages = parseInt(totalPagesInput.value);
        slider.max = totalPages;
        if (currentPage > totalPages) {
          currentPage = totalPages;
          updateControls();
        }
      });
    
      // Previous button functionality
      prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--;
          updateControls();
        }
      });
    
      // Next button functionality
      nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
          currentPage++;
          updateControls();
        }
      });
    
      // Initialize controls
      updateControls();
   