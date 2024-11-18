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

    // Extract values from the form
    const email = form.email.value;
    const password = form.password.value;

    // Get the user's location
    getUserLocation()
        .then((location) => {
            // Proceed with login request after getting location
            sendLoginRequest(form, email, password, location);
        })
        .catch((error) => {
            console.error("Geolocation error:", error);
           // alert("Unable to retrieve location. Proceeding with default location.");
            
            const defaultLocation = { latitude: 6.5244, longitude: 3.3792 }; 
            sendLoginRequest(form, email, password, defaultLocation);
        });

    return false;
}

// Utility function to get the user's location
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    resolve({ latitude, longitude });
                },
                (error) => {
                    reject(error);
                }
            );
        } else {
            reject(new Error("Geolocation is not supported by your browser."));
        }
    });
}

// Function to send the login request
function sendLoginRequest(form, email, password, location) {
    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, location }),
    })
        .then(response => response.json())
        .then(res => {
            form.submit.removeAttribute("disabled");
            form.submit.innerHTML = `<span>Login</span>`;

            if (res.status === "success") {
                localStorage.setItem("accessToken", res.accessToken);
                window.location.href = res.profileImage ? "/posts" : "/updateProfile";
            } else {
                alert(res.message);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
            form.submit.removeAttribute("disabled");
            form.submit.innerHTML = `<span>Login</span>`;
        });
}



/*
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
            window.location.href = res.profileImage ? "/posts" : "/updateProfile";
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
*/