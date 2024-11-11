function doRegister(form) {
    form.submit.setAttribute("disabled", "disabled");
    form.submit.innerHTML = `<span>Loading...</span>`;

    // Create FormData from the form
    const formData = new FormData(form);

    fetch("/signup", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(response => {
        form.submit.removeAttribute("disabled");
        form.submit.innerHTML = "<span>Register</span>";

        alert(response.message);

        if (response.status === 'success') {
            window.location.href = "/login";
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
        form.submit.removeAttribute("disabled");
        form.submit.innerHTML = "<span>Register</span>";
    });

    return false;
}

function doLogin(form) {
    form.submit.setAttribute("disabled", "disabled");
    form.submit.innerHTML = `<span>Loading...</span>`;

    // Extract values from the form manually to send as JSON
    const email = form.email.value;
    const password = form.password.value;

    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(res => {
        form.submit.removeAttribute("disabled");
        form.submit.innerHTML = `<span>Login</span>`;

        if (res.status === "success") {
            localStorage.setItem("accessToken", res.accessToken);
            window.location.href = res.profileImage ? "/" : "/updateProfile";
        } else {
            alert(res.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    });

    return false;
}
