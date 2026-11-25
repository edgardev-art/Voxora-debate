// ============================================
// VOXORA - Main JavaScript
// ============================================

document.addEventListener("DOMContentLoaded", function () {

    // ============================================
    // 1. SUPABASE CONNECTION
    // ============================================

    const SUPABASE_URL = "https://eqqvxcbxylzyaicauuhw.supabase.co";

    const SUPABASE_KEY = "sb_publishable_cGNR8HhZ8x2hwWSJ6LBGpA_Qseo4i0-";

    const supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
    console.log("VOXORA connected to Supabase!");

    // ============================================
    // 2. ELEMENTS
    // ============================================
    const debateList = document.getElementById("debateList");
    const noResults = document.getElementById("noResults");

    const searchInput = document.getElementById("searchInput");
    const searchForm = document.getElementById("searchForm");

    const categoryChips = document.querySelectorAll(".category-chip");
    const feedTabs = document.querySelectorAll(".feed-tab");

    const themeToggle = document.getElementById("themeToggle");

    const notificationToggle = document.getElementById("notificationToggle");
    const notificationPanel = document.getElementById("notificationPanel");

    const profileButton = document.getElementById("profileButton");
    const profileAvatar = document.getElementById("profileAvatar");

    const authOverlay = document.getElementById("authOverlay");
    const authClose = document.getElementById("authClose");
    const authForm = document.getElementById("authForm");

    const authUsername = document.getElementById("authUsername");
    const authEmail = document.getElementById("authEmail");
    const authPassword = document.getElementById("authPassword");

    const authMessage = document.getElementById("authMessage");
    const authSubmit = document.getElementById("authSubmit");

    const usernameField = document.getElementById("usernameField");

    const authSwitch = document.getElementById("authSwitch");
    const authSwitchButton = document.getElementById("authSwitchButton");

    const authTitle = document.getElementById("authTitle");
    const authDescription = document.getElementById("authDescription");

    const accountProfile = document.getElementById("accountProfile");
    const accountUsername = document.getElementById("accountUsername");
    const accountEmail = document.getElementById("accountEmail");

    const logoutButton = document.getElementById("logoutButton");

    const createDebateForm = document.getElementById("createDebateForm");
    const createDebateMessage = document.getElementById("createDebateMessage");
    const publishDebateButton = document.getElementById("publishDebateButton");

    const debateTitle = document.getElementById("debateTitle");
    const debateDescription = document.getElementById("debateDescription");
    const debateCategory = document.getElementById("debateCategory");
    const debateSideA = document.getElementById("debateSideA");
    const debateSideB = document.getElementById("debateSideB");

    // ============================================
    // 3. APPLICATION STATE
    // ============================================

    let currentCategory = "all";
    let currentFeed = "latest";
    let currentSearch = "";

    let currentUser = null;
    let isSignupMode = true;

    let allDebates = [];

    // ============================================
    // 4. HELPER FUNCTIONS
    // ============================================

    function escapeHTML(value) {
        const div = document.createElement("div");
        div.textContent = value ?? "";
        return div.innerHTML;
    }

    function showMessage(element, message, type = "info") {

        if (!element) return;

        element.textContent = message;

        element.className = "message " + type;

        element.style.display = "block";
    }

    function hideMessage(element) {

        if (!element) return;

        element.textContent = "";
        element.style.display = "none";
    }

    function formatDate(dateString) {

        if (!dateString) return "Recently";

        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return "Recently";
        }

        const now = new Date();

        const difference = now - date;

        const minutes = Math.floor(difference / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return "Just now";

        if (minutes < 60) {
            return `${minutes}m ago`;
        }

        if (hours < 24) {
            return `${hours}h ago`;
        }

        if (days < 7) {
            return `${days}d ago`;
        }

        return date.toLocaleDateString();
    }

    function getInitials(username) {

        if (!username) return "VO";

        return username
            .split(" ")
            .map(word => word.charAt(0))
            .join("")
            .substring(0, 2)
            .toUpperCase();
    }

    function getCategoryColor(category) {

        const colors = {
            society: "purple",
            technology: "blue",
            politics: "red",
            education: "orange",
            environment: "green",
            entertainment: "pink",
            science: "cyan",
            other: "gray"
        };

        return colors[category?.toLowerCase()] || "gray";
    }

    // ============================================
    // 5. SEARCH FUNCTIONALITY
    // ============================================

    function performSearch() {

        if (!searchInput) return;

        currentSearch = searchInput.value.trim().toLowerCase();

        renderDebates();
    }

    if (searchInput) {

        searchInput.addEventListener("input", performSearch);
    }

    if (searchForm) {

        searchForm.addEventListener("submit", function (event) {

            event.preventDefault();

            performSearch();
        });
    }

    // ============================================
    // 6. CATEGORY FILTERS
    // ============================================

    categoryChips.forEach(chip => {

        chip.addEventListener("click", function () {

            categoryChips.forEach(item => {
                item.classList.remove("active");
            });

            this.classList.add("active");

            currentCategory = this.dataset.category || "all";

            renderDebates();
        });
    });

    // ============================================
    // 7. TRENDING TOPICS
    // ============================================

    document.querySelectorAll(".trending-item").forEach(item => {

        item.addEventListener("click", function () {

            const topic = this.dataset.topic || this.textContent.trim();

            if (searchInput) {

                searchInput.value = topic;

                currentSearch = topic.toLowerCase();

                renderDebates();
            }
        });
    });

    // ============================================
    // 8. FEED FILTERS
    // ============================================

    feedTabs.forEach(tab => {

        tab.addEventListener("click", function () {

            feedTabs.forEach(item => {
                item.classList.remove("active");
            });

            this.classList.add("active");

            currentFeed = this.dataset.feed || "latest";

            renderDebates();
        });
    });

    // ============================================
    // 9. DARK / LIGHT MODE
    // ============================================

    const savedTheme = localStorage.getItem("voxora-theme");

    if (savedTheme === "light") {

        document.body.classList.add("light-mode");

    } else {

        document.body.classList.remove("light-mode");
    }

    if (themeToggle) {

        themeToggle.addEventListener("click", function () {

            document.body.classList.toggle("light-mode");

            const isLight = document.body.classList.contains("light-mode");

            localStorage.setItem(
                "voxora-theme",
                isLight ? "light" : "dark"
            );
        });
    }

    // ============================================
    // 10. NOTIFICATIONS
    // ============================================

    if (notificationToggle && notificationPanel) {

        notificationToggle.addEventListener("click", function (event) {

            event.stopPropagation();

            notificationPanel.classList.toggle("active");
        });

        document.addEventListener("click", function (event) {

            if (
                !notificationPanel.contains(event.target) &&
                !notificationToggle.contains(event.target)
            ) {

                notificationPanel.classList.remove("active");
            }
        });
    }

    // ============================================
    // 11. AUTHENTICATION MODAL
    // ============================================

    function openAuthModal() {

        if (!authOverlay) return;

        authOverlay.classList.add("active");

        document.body.style.overflow = "hidden";
    }

    function closeAuthModal() {

        if (!authOverlay) return;

        authOverlay.classList.remove("active");

        document.body.style.overflow = "";
    }

    if (profileButton) {

        profileButton.addEventListener("click", function () {

            if (currentUser) {

                openAccountProfile();

            } else {

                openAuthModal();
            }
        });
    }

    if (authClose) {

        authClose.addEventListener("click", closeAuthModal);
    }

    if (authOverlay) {

        authOverlay.addEventListener("click", function (event) {

            if (event.target === authOverlay) {

                closeAuthModal();
            }
        });
    }

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {

            closeAuthModal();
        }
    });

    // ============================================
    // 12. SIGNUP / LOGIN SWITCH
    // ============================================

    function updateAuthMode() {

        if (isSignupMode) {

            if (authTitle) {
                authTitle.textContent = "Create Account";
            }

            if (authDescription) {
                authDescription.textContent =
                    "Join VOXORA and start sharing your opinions.";
            }

            if (authSubmit) {
                authSubmit.textContent = "Create Account";
            }

            if (usernameField) {
                usernameField.style.display = "block";
            }

            if (authUsername) {
                authUsername.required = true;
            }

            if (authSwitch) {
                authSwitch.innerHTML = "Already have an account?";
            }

            if (authSwitchButton) {
                authSwitchButton.textContent = "Login";
            }

        } else {

            if (authTitle) {
                authTitle.textContent = "Welcome Back";
            }

            if (authDescription) {
                authDescription.textContent =
                    "Login to continue your VOXORA journey.";
            }

            if (authSubmit) {
                authSubmit.textContent = "Login";
            }

            if (usernameField) {
                usernameField.style.display = "none";
            }

            if (authUsername) {
                authUsername.required = false;
            }

            if (authSwitch) {
                authSwitch.innerHTML = "Don't have an account?";
            }

            if (authSwitchButton) {
                authSwitchButton.textContent = "Sign Up";
            }
        }

        hideMessage(authMessage);
    }

    if (authSwitchButton) {

        authSwitchButton.addEventListener("click", function () {

            isSignupMode = !isSignupMode;

            updateAuthMode();
        });
    }

    // ============================================
    // 13. SIGNUP AND LOGIN
    // ============================================

    if (authForm) {

        authForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            hideMessage(authMessage);

            const email = authEmail?.value.trim();
            const password = authPassword?.value;
            const username = authUsername?.value.trim();

            if (!email || !password) {

                showMessage(
                    authMessage,
                    "Please fill in all required fields.",
                    "error"
                );

                return;
            }

            if (isSignupMode) {

                if (!username) {

                    showMessage(
                        authMessage,
                        "Please enter a username.",
                        "error"
                    );

                    return;
                }

                if (username.length < 3) {

                    showMessage(
                        authMessage,
                        "Your username must contain at least 3 characters.",
                        "error"
                    );

                    return;
                }

                if (password.length < 6) {

                    showMessage(
                        authMessage,
                        "Your password must contain at least 6 characters.",
                        "error"
                    );

                    return;
                }
            }

            if (authSubmit) {

                authSubmit.disabled = true;

                authSubmit.textContent = "Please wait...";
            }

            try {

                if (isSignupMode) {

                    const { data, error } =
                        await supabaseClient.auth.signUp({

                            email: email,

                            password: password,

                            options: {

                                data: {
                                    username: username
                                }
                            }
                        });

                    if (error) throw error;

                    if (data.user) {

                        showMessage(
                            authMessage,
                            "Account created! Check your email to confirm your account.",
                            "success"
                        );

                        authForm.reset();
                    }

                } else {

                    const { data, error } =
                        await supabaseClient.auth.signInWithPassword({

                            email: email,

                            password: password
                        });

                    if (error) throw error;

                    currentUser = data.user;

                    closeAuthModal();

                    await updateAccountUI();

                    await loadDebates();
                }

            } catch (error) {

                console.error("Authentication error:", error);

                showMessage(
                    authMessage,
                    error.message || "Something went wrong.",
                    "error"
                );

            } finally {

                if (authSubmit) {

                    authSubmit.disabled = false;

                    updateAuthMode();
                }
            }
        });
    }

    // ============================================
    // 14. ACCOUNT PROFILE
    // ============================================

    function openAccountProfile() {

        if (!accountProfile) return;

        accountProfile.classList.add("active");

        document.body.style.overflow = "hidden";
    }

    function closeAccountProfile() {

        if (!accountProfile) return;

        accountProfile.classList.remove("active");

        document.body.style.overflow = "";
    }

    if (accountProfile) {

        accountProfile.addEventListener("click", function (event) {

            if (event.target === accountProfile) {

                closeAccountProfile();
            }
        });
    }

    // ============================================
    // 15. UPDATE ACCOUNT UI
    // ============================================

    async function updateAccountUI() {

        if (!currentUser) {

            if (profileAvatar) {
                profileAvatar.textContent = "👤";
            }

            return;
        }

        let username = currentUser.user_metadata?.username || "User";

        try {

            const { data: profile, error } = await supabaseClient
                .from("profiles")
                .select("username")
                .eq("id", currentUser.id)
                .maybeSingle();

            if (error) {

                console.warn("Could not load profile:", error.message);

            } else if (profile?.username) {

                username = profile.username;
            }

        } catch (error) {

            console.warn("Profile loading error:", error);
        }

        if (profileAvatar) {

            profileAvatar.textContent = getInitials(username);
        }

        if (accountUsername) {

            accountUsername.textContent = username;
        }

        if (accountEmail) {

            accountEmail.textContent = currentUser.email || "";
        }
    }

    // ============================================
    // 16. LOGOUT
    // ============================================

    if (logoutButton) {

        logoutButton.addEventListener("click", async function () {

            const { error } = await supabaseClient.auth.signOut();

            if (error) {

                console.error("Logout error:", error);

                return;
            }

            currentUser = null;

            closeAccountProfile();

            await updateAccountUI();

            await loadDebates();

            console.log("Logged out successfully.");
        });
    }

    // ============================================
    // 17. SESSION MANAGEMENT
    // ============================================

    async function checkSession() {

        const { data, error } =
            await supabaseClient.auth.getSession();

        if (error) {

            console.error("Session error:", error.message);

            return;
        }

        currentUser = data.session?.user || null;

        await updateAccountUI();
    }

    supabaseClient.auth.onAuthStateChange(
        async function (event, session) {

            currentUser = session?.user || null;

            await updateAccountUI();

            console.log("Auth event:", event);
        }
    );

    // ============================================
    // 18. CREATE DEBATE
    // ============================================

    if (createDebateForm) {

        createDebateForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            hideMessage(createDebateMessage);

            if (!currentUser) {

                showMessage(
                    createDebateMessage,
                    "Please login before creating a debate.",
                    "error"
                );

                openAuthModal();

                return;
            }

            const title = debateTitle?.value.trim();
            const description = debateDescription?.value.trim();
            const category = debateCategory?.value;
            const sideA = debateSideA?.value.trim();
            const sideB = debateSideB?.value.trim();

            if (!title || !description || !category || !sideA || !sideB) {

                showMessage(
                    createDebateMessage,
                    "Please complete all debate fields.",
                    "error"
                );

                return;
            }

            if (publishDebateButton) {

                publishDebateButton.disabled = true;

                publishDebateButton.textContent = "Publishing...";
            }

            try {

                const { data, error } = await supabaseClient
                    .from("debates")
                    .insert({

                        author_id: currentUser.id,

                        title: title,

                        description: description,

                        category: category,

                        side_a: sideA,

                        side_b: sideB,

                        status: "open"
                    })
                    .select()
                    .single();

                if (error) throw error;

                showMessage(
                    createDebateMessage,
                    "Your debate has been published successfully!",
                    "success"
                );

                createDebateForm.reset();

                // Immediately update the feed
                await loadDebates();

                // Scroll to the debate feed
                if (debateList) {

                    debateList.scrollIntoView({

                        behavior: "smooth",

                        block: "start"
                    });
                }

                console.log("Debate published:", data);

            } catch (error) {

                console.error("Publishing error:", error);

                showMessage(
                    createDebateMessage,
                    error.message || "Could not publish your debate.",
                    "error"
                );

            } finally {

                if (publishDebateButton) {

                    publishDebateButton.disabled = false;

                    publishDebateButton.textContent = "Publish Debate";
                }
            }
        });
    }

    // ============================================
    // 19. LOAD DEBATES FROM SUPABASE
    // ============================================

    async function loadDebates() {

        if (!debateList) {

            console.error("Debate list element not found.");

            return;
        }

        debateList.innerHTML = `
            <div class="loading-message">
                <p>Loading debates...</p>
            </div>
        `;

        try {

            const { data, error } = await supabaseClient
                .from("debates")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            allDebates = data || [];

            // Try to load author profiles
            await loadDebateProfiles();

            renderDebates();

            console.log("Debates loaded:", allDebates.length);

        } catch (error) {

            console.error("Could not load debates:", error);

            debateList.innerHTML = `
                <div class="error-message">
                    <h3>Unable to load debates</h3>
                    <p>Please check your connection and try again.</p>
                </div>
            `;
        }
    }

    // ============================================
    // 20. LOAD DEBATE AUTHOR PROFILES
    // ============================================

    async function loadDebateProfiles() {

        if (!allDebates.length) return;

        const authorIds = [
            ...new Set(allDebates.map(debate => debate.author_id))
        ];

        if (!authorIds.length) return;

        try {

            const { data, error } = await supabaseClient
                .from("profiles")
                .select("id, username")
                .in("id", authorIds);

            if (error) throw error;

            const profiles = data || [];

            allDebates = allDebates.map(debate => {

                const profile = profiles.find(
                    item => item.id === debate.author_id
                );

                return {

                    ...debate,

                    author_username:
                        profile?.username ||
                        "VOXORA Member"
                };
            });

        } catch (error) {

            console.warn("Could not load profiles:", error.message);

            allDebates = allDebates.map(debate => ({

                ...debate,

                author_username:
                    debate.author_username ||
                    "VOXORA Member"
            }));
        }
    }

    // ============================================
    // 21. FILTER DEBATES
    // ============================================

    function getFilteredDebates() {

        let debates = [...allDebates];

        // Category filtering
        if (currentCategory !== "all") {

            debates = debates.filter(debate =>

                debate.category?.toLowerCase() ===
                currentCategory.toLowerCase()
            );
        }

        // Search filtering
        if (currentSearch) {

            debates = debates.filter(debate => {

                const searchableText = [

                    debate.title,

                    debate.description,

                    debate.category,

                    debate.side_a,

                    debate.side_b,

                    debate.author_username

                ].join(" ").toLowerCase();

                return searchableText.includes(currentSearch);
            });
        }

        // Feed sorting
        if (currentFeed === "latest") {

            debates.sort((a, b) =>

                new Date(b.created_at) - new Date(a.created_at)
            );

        } else if (currentFeed === "popular") {

            debates.sort((a, b) =>

                getLikeCount(b.id) - getLikeCount(a.id)
            );

        } else if (currentFeed === "following") {

            if (currentUser) {

                debates = debates.filter(debate =>

                    debate.author_id === currentUser.id
                );

            } else {

                debates = [];
            }
        }

        return debates;
    }

    // ============================================
    // 22. LOCAL LIKE STORAGE
    // ============================================

    function getLikeCount(debateId) {

        const likes = JSON.parse(
            localStorage.getItem("voxora-likes") || "{}"
        );

        return likes[debateId]?.count || 0;
    }

    function isLiked(debateId) {

        const likes = JSON.parse(
            localStorage.getItem("voxora-likes") || "{}"
        );

        return likes[debateId]?.liked || false;
    }

    function toggleLike(debateId) {

        const likes = JSON.parse(
            localStorage.getItem("voxora-likes") || "{}"
        );

        if (!likes[debateId]) {

            likes[debateId] = {

                count: 0,

                liked: false
            };
        }

        if (likes[debateId].liked) {

            likes[debateId].count--;

            likes[debateId].liked = false;

        } else {

            likes[debateId].count++;

            likes[debateId].liked = true;
        }

        localStorage.setItem(
            "voxora-likes",
            JSON.stringify(likes)
        );
    }

    // ============================================
    // 23. SAVE DEBATES
    // ============================================

    function isSaved(debateId) {

        const saved = JSON.parse(
            localStorage.getItem("voxora-saved") || "[]"
        );

        return saved.includes(debateId);
    }

    function toggleSave(debateId) {

        let saved = JSON.parse(
            localStorage.getItem("voxora-saved") || "[]"
        );

        if (saved.includes(debateId)) {

            saved = saved.filter(id => id !== debateId);

        } else {

            saved.push(debateId);
        }

        localStorage.setItem(
            "voxora-saved",
            JSON.stringify(saved)
        );
    }

    // ============================================
    // 24. RENDER DEBATE CARDS
    // ============================================

    function renderDebates() {

        if (!debateList) return;

        const debates = getFilteredDebates();

        if (debates.length === 0) {

            debateList.innerHTML = "";

            if (noResults) {

                noResults.style.display = "block";
            }

            return;
        }

        if (noResults) {

            noResults.style.display = "none";
        }

        debateList.innerHTML = debates.map(debate => {

            const title = escapeHTML(debate.title);

            const description = escapeHTML(debate.description);

            const category = escapeHTML(debate.category);

            const sideA = escapeHTML(debate.side_a);

            const sideB = escapeHTML(debate.side_b);

            const author = escapeHTML(
                debate.author_username || "VOXORA Member"
            );

            const initials = escapeHTML(
                getInitials(debate.author_username)
            );

            const date = formatDate(debate.created_at);

            const liked = isLiked(debate.id);

            const saved = isSaved(debate.id);

            const likes = getLikeCount(debate.id);

            const categoryColor = getCategoryColor(debate.category);

            return `

                <article class="card debate-card"
                    data-category="${category}"
                    data-votes="${likes}"
                    data-date="${escapeHTML(debate.created_at)}">

                    <div class="debate-author">

                        <span class="avatar avatar-purple">
                            ${initials}
                        </span>

                        <div>

                            <strong>${author}</strong>

                            <span class="debate-date">
                                ${date}
                            </span>

                        </div>

                    </div>

                    <div class="debate-content">

                        <span class="category-badge ${categoryColor}">
                            ${category}
                        </span>

                        <h3>${title}</h3>

                        <p>${description}</p>

                    </div>

                    <div class="debate-sides">

                        <div class="debate-side side-a">

                            <span class="side-label">
                                SIDE A
                            </span>

                            <p>${sideA}</p>

                        </div>

                        <div class="debate-side side-b">

                            <span class="side-label">
                                SIDE B
                            </span>

                            <p>${sideB}</p>

                        </div>

                    </div>

                    <div class="debate-actions">

                        <button class="like-button ${liked ? "liked" : ""}"
                            data-debate-id="${debate.id}">

                            <span class="like-icon">
                                ${liked ? "❤️" : "🤍"}
                            </span>

                            <span class="like-count">
                                ${likes}
                            </span>

                        </button>

                        <button class="discuss-button"
                            data-debate-id="${debate.id}">

                            💬 Discuss

                        </button>

                        <button class="save-button ${saved ? "saved" : ""}"
                            data-debate-id="${debate.id}">

                            ${saved ? "🔖 Saved" : "🔖 Save"}

                        </button>

                    </div>

                </article>

            `;

        }).join("");
    }

    // ============================================
    // 25. DEBATE BUTTON EVENTS
    // ============================================

    if (debateList) {

        debateList.addEventListener("click", function (event) {

            const likeButton = event.target.closest(".like-button");

            const saveButton = event.target.closest(".save-button");

            const discussButton = event.target.closest(".discuss-button");

            // LIKE BUTTON
            if (likeButton) {

                const debateId = likeButton.dataset.debateId;

                toggleLike(debateId);

                renderDebates();

                return;
            }

            // SAVE BUTTON
            if (saveButton) {

                const debateId = saveButton.dataset.debateId;

                toggleSave(debateId);

                renderDebates();

                return;
            }

            // DISCUSS BUTTON
            if (discussButton) {

                const debateId = discussButton.dataset.debateId;

                const debate = allDebates.find(
                    item => item.id === debateId
                );

                if (debate) {

                    alert(
                        "Discussion feature coming soon!\n\n" +
                        debate.title
                    );
                }
            }
        });
    }

    // ============================================
    // 26. INITIALIZE THE APPLICATION
    // ============================================

    async function initializeApp() {

        console.log("Initializing VOXORA...");

        await checkSession();

        await loadDebates();

        console.log("VOXORA is ready!");
    }

    // Expose for debugging in browser Console
    window.loadDebates = loadDebates;

    window.renderDebates = renderDebates;

    // Start the application
    initializeApp();

});
