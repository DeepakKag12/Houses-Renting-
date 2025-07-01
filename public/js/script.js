(() => {
  'use strict'

  const forms = document.querySelectorAll('.needs-validation')

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      const ratingInput = form.querySelector('input[type="range"]')

      // Manually check if a rating is selected (not 0 or empty)
      if (ratingInput && (!ratingInput.value || ratingInput.value < 1)) {
        ratingInput.setCustomValidity('Please select a rating')
      } else {
        ratingInput.setCustomValidity('')
      }

      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()
