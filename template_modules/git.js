for (let index = 0; index < inputs.length; index++) {
        const el = inputs[index];
        el.parentElement.classList.remove("--form-focus");
        el.classList.remove("--form-focus");
        formValidate.removeSuccess(el);
        formValidate.removeError(el);
      }
      let checkboxes = form.querySelectorAll('input[type="checkbox"]');
      if (checkboxes.length) {
        checkboxes.forEach((checkbox) => {
          checkbox.checked = false;
        });
      }
      if (window["flsSelect"]) {
        let selects = form.querySelectorAll("select[data-fls-select]");
        if (selects.length) {
          selects.forEach((select) => {
            formValidate.removeError(select);
            formValidate.removeSuccess(select);
            const selectWrapper = select.closest(".select");
            if (selectWrapper) {
              selectWrapper.classList.remove("--form-error");
              selectWrapper.classList.remove("--form-success");
              const formItem = select.closest(".popup__form-item");
              if (formItem) {
                formItem.classList.remove("--form-erro