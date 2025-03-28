const STUDENT_ID = "M00872711";
//const API_URL = `http://localhost:8080/${STUDENT_ID}`;
const API_URL = `https://sostore.onrender.com/${STUDENT_ID}`;
let token = localStorage.getItem("token");

$(document).ready(function () {
        fetchFiles();
        fetchUsers();
        
});

// Register User
function register() {
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const errorElement = document.getElementById("error");

    // Reset previous error messages
    errorElement.innerHTML = "";
    errorElement.classList.remove("reveal", "alert", "alert-danger");

    // Validation checks
    if (!username || !password) {
        showError("Username and password are required.");
        return;
    }

    if (username.length < 3) {
        showError("Username must be at least 3 characters long.");
        return;
    }

    if (password.length < 8) {
        showError("Password must be at least 8 characters long.");
        return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[\W_]/.test(password)) {
        showError("Password must contain uppercase, lowercase, a number, and a special character.");
        return;
    }

    // Send registration request if validation passes
    fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            showError(data.error); // Display server error message
        } else {
            showSuccess(data.message);
            document.getElementById("regUsername").value = "";
            document.getElementById("regPassword").value = "";
        }
    })
    .catch(err => {
        showError("An error occurred. Please try again.");
        console.error("Registration Error:", err);
    });

    function showError(message) {
        errorElement.innerHTML = `<div class="reveal alert alert-danger">${message}</div>`;
        errorElement.classList.add("reveal", "alert", "alert-danger");
    }

    function showSuccess(message) {
        errorElement.innerHTML = `<div class="reveal alert alert-success">${message}</div>`;
        errorElement.classList.add("reveal", "alert", "alert-success");
    }
}


// Login User
function login() {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const errorElement = document.getElementById("error");

    // Reset previous error messages
    errorElement.innerHTML = "";
    errorElement.classList.remove("reveal", "alert", "alert-danger", "alert-success");

    // Validation checks
    if (!username || !password) {
        showError("Username and password are required.");
        return;
    }

    if (username.length < 3) {
        showError("Username must be at least 3 characters long.");
        return;
    }

    if (password.length < 8) {
        showError("Password must be at least 8 characters long.");
        return;
    }

    // Send login request if validation passes
    fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem("token", data.token);
            token = data.token;
            //loadPage('dashboard');
            window.location.href ="./dashboard.html";
        } else {
            showError("Invalid username or password.");
        }
    })
    .catch(err => {
        showError("An error occurred. Please try again.");
        console.error("Login Error:", err);
    });

    function showError(message) {
        errorElement.innerHTML = `<div class="reveal alert alert-danger">${message}</div>`;
        errorElement.classList.add("reveal", "alert", "alert-danger");
    }

    function showSuccess(message) {
        errorElement.innerHTML = `<div class="reveal alert alert-success">${message}</div>`;
        errorElement.classList.add("reveal", "alert", "alert-success");
    }
}


// Fetch Files (Authenticated)
function fetchFiles() {
    fetch(`${API_URL}/files`, {
        headers: { 
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(files => {
        const fileList = document.getElementById("fileList");
        fileList.innerHTML = ""; // Clear previous content
        const searchInput = document.getElementById("searchInput");

        // Function to render filtered results
        function renderFiles(filteredFiles) {
            const row = document.createElement("div");
            row.innerHTML = "";
            fileList.innerHTML = "";
            row.className = "row g-3"; // Bootstrap grid with gap

            row.innerHTML = filteredFiles.map(file => `
                <div class="col-md-4">
                    <div class="card shadow-sm">
                        <img src="${API_URL}/uploads/${file.filename}" class="card-img-top" alt="${file.originalname}" style="height: 200px; object-fit: cover;">
                        <div class="card-body text-center">
                            <h5 class="card-title">${file.originalname}</h5>
                            <a href="${API_URL}/uploads/${file.filename}" target="_blank" class="btn btn-primary btn-sm">Download</a>
                            <button class="btn btn-danger btn-sm" onclick="deleteFile('${file.filename}')">Delete</button>
                        </div>
                    </div>
                </div>
            `).join(""); // Convert array to string

            fileList.appendChild(row);
        }

        // Initial render of all files
        renderFiles(files);

        // Add event listener for search
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.toLowerCase();
            const filteredFiles = files.filter(file => file.originalname.toLowerCase().includes(query));
            renderFiles(filteredFiles);
        });

        
    })
    .catch(err => console.error("Error fetching files:", err));
}


//Fetch users
function fetchUsers() {
    fetch(`${API_URL}/users`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(users => {
        const userList = document.getElementById("userList");
        userList.innerHTML = ""; // Clear previous content
        const searchInput = document.getElementById("searchUser");

        // Function to render users
        function renderUsers(filteredUsers) {
            userList.innerHTML = ""; // Clear list
            const row = document.createElement("div");
            row.className = "row g-3"; // Bootstrap grid with gap

            row.innerHTML = filteredUsers.map(user => `
                <div class="col-md-4">
                    <div class="card shadow-sm">
                        <div class="card-body text-center">
                            <img src="https://img.icons8.com/?size=100&id=492ILERveW8G&format=png&color=000000"
                                style="height:50px;width:50px;" class="rounded"/>
                            <h5 class="card-title">${user.username}</h5>
                            <button id="followBtn-${user._id}" class="btn btn-success btn-sm" onclick="followUser('${user._id}')">
                                Follow
                            </button>
                        </div>
                    </div>
                </div>
            `).join(""); // Convert array to string

            userList.appendChild(row);
        }

        // Initial render of all users
        renderUsers(users);

        // Add event listener for search
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.toLowerCase();
            const filteredUsers = users.filter(user => user.username.toLowerCase().includes(query));
            renderUsers(filteredUsers);
        });

    })
    .catch(error => console.error("Error fetching users:", error));
}


// Handle file upload
document.getElementById("uploadForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent default form submission

    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file to upload.");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch(`${API_URL}/upload`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}` // Ensure token is sent
            },
            body: formData
        });

        console.log(response);

        if (response.ok) {
            alert('Upload Success message'); // Success message
            fileInput.value = ""; // Clear file input
            fetchFiles(); // Refresh file list
        } 
        else {
            alert("Upload failed. Try again.");
        }
    } catch (error) {
        console.error("Upload error:", error);
        alert("An error occurred. Please try again.");
    }
});

document.getElementById("fileInput").addEventListener("change", function () {
    const file = this.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("imagePreview").src = e.target.result;
            document.getElementById("imagePreview").style.display = "block"; // Show image
        };
        reader.readAsDataURL(file);
    }
});

//DELETE USERS
async function deleteFile(filename) {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
        const response = await fetch(`${API_URL}/delete/${filename}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert("File deleted successfully!");
            fetchFiles(); // Refresh file list after deletion
        } else {
            alert(`Failed to delete file: ${data.message}`);
        }
    } catch (error) {
        console.error("Delete error:", error);
        alert("An error occurred. Please try again.");
    }
}


//Follow users
function followUser(userId) {
    fetch(`${API_URL}/follow/${userId}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            const followBtn = document.getElementById(`followBtn-${userId}`);
            followBtn.innerText = "Following";
            followBtn.classList.remove("btn-success");
            followBtn.classList.add("btn-secondary");
            followBtn.disabled = true; // Prevent multiple clicks
        }
    })
    .catch(error => console.error("Error following user:", error));
}


// Logout
function logout() {
    localStorage.removeItem("token");
    document.getElementById("auth").style.display = "block";
    document.getElementById("fileSection").style.display = "none";
}


function navigate(event, page) {
    event.preventDefault();  // Prevent full page reload
    history.pushState({ page }, "", `/${page}`);  // Update URL
    loadPage(page);
}

function loadPage(page) {
    fetch(`./${page}.html`)
        .then(response => response.text())
        .then(html => {
            document.getElementById("content").innerHTML = html;
            updateActiveLink(page);
        })
        .catch(() => document.getElementById("content").innerHTML = "<h2>Page not found</h2>");
}

function updateActiveLink(page) {
    document.querySelectorAll("nav a").forEach(link => {
        link.classList.toggle("active", link.href.endsWith(`/${page}`));
    });
}

window.addEventListener("popstate", (event) => {
    const page = event.state?.page || "home";
    loadPage(page);
});


