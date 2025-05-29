document.addEventListener("DOMContentLoaded", () => {
    // Highlight current nav link
    const links = document.querySelectorAll(".profile-content ul li a");
    const currentPath = window.location.pathname.split("/").pop();

    links.forEach(link => {
        if (link.getAttribute("href") === currentPath) {
            link.classList.add("active");
        }
    });

    const gallery = document.getElementById("gallery");

    // Fetch and render photos from JSON
    fetch('json/data.json')
        .then(res => res.json())
        .then(photos => {
            photos.forEach(({ src, alt, title, date }) => {
                const item = document.createElement("div");
                item.className = "masonry-item";
                
                item.innerHTML = `
                    <img src="${src}" alt="${alt}" class="original" />
                    <img src="${src}" alt="${alt}" class="blurred" />
                    <div class="image-overlay">
                        <div class="overlay-text">
                            <h3>${title}</h3>
                            <p>${date}</p>
                        </div>
                    </div>
                `;
                gallery.appendChild(item);
            });

            // Add lightbox logic after photos are rendered
            setupLightbox(photos);
        });

    // Setup lightbox functionality
    function setupLightbox(photos) {
        let currentPhotoIndex = -1;

        const lightbox = document.createElement("div");
        lightbox.id = "lightbox";

        const closeButton = document.createElement("i");
        closeButton.className = "fa-sharp fa-light fa-xmark close-lightbox-button";
        closeButton.setAttribute("aria-label", "Close lightbox");

        const fullscreenButton = document.createElement("i");
        fullscreenButton.className = "fa-sharp fa-light fa-arrow-up-right-and-arrow-down-left-from-center fullscreen-lightbox-button";
        fullscreenButton.setAttribute("aria-label", "Toggle fullscreen");

        const prevButton = document.createElement("i");
        prevButton.className = "fa-sharp fa-light fa-chevron-left lightbox-nav-button prev-button";
        prevButton.setAttribute("aria-label", "Previous photo");

        const nextButton = document.createElement("i");
        nextButton.className = "fa-sharp fa-light fa-chevron-right lightbox-nav-button next-button";
        nextButton.setAttribute("aria-label", "Next photo");

        // Add event listener to close lightbox when clicked
        closeButton.addEventListener("click", () => {
            lightbox.classList.remove("active");
        });

        // Add event listener to view the image in fullscreen
        fullscreenButton.addEventListener("click", () => {
        if (!document.fullscreenElement) {
            lightbox.requestFullscreen().then(() => {
                lightbox.classList.add("fullscreen-mode");
                fullscreenButton.classList.remove("fa-arrow-up-right-and-arrow-down-left-from-center");
                fullscreenButton.classList.add("fa-arrow-down-left-and-arrow-up-right-to-center");
            }).catch(err => console.error("Fullscreen failed:", err));
        } else {
            document.exitFullscreen().then(() => {
                    lightbox.classList.remove("fullscreen-mode");
                    fullscreenButton.classList.remove("fa-arrow-down-left-and-arrow-up-right-to-center");
                    fullscreenButton.classList.add("fa-arrow-up-right-and-arrow-down-left-from-center");
                });
            }
        });

        prevButton.addEventListener("click", (e) => {
            e.stopPropagation();
            currentPhotoIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
            const photo = photos[currentPhotoIndex];
            updateLightbox(photo, photo.src);
        });

        nextButton.addEventListener("click", (e) => {
            e.stopPropagation();
            currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
            const photo = photos[currentPhotoIndex];
            updateLightbox(photo, photo.src);
        });

        const lightboxImgContainer = document.createElement("div");
        lightboxImgContainer.id = "lightbox-img-container";

        const lightboxImageSide = document.createElement("div");
        lightboxImageSide.className = "lightbox-left";

        const lightboxInfoSide = document.createElement("div");
        lightboxInfoSide.className = "lightbox-right";

        lightboxImgContainer.appendChild(lightboxImageSide);
        lightboxImgContainer.appendChild(lightboxInfoSide);
        lightbox.appendChild(closeButton);
        lightbox.appendChild(fullscreenButton);
        lightbox.appendChild(prevButton);
        lightbox.appendChild(nextButton);
        lightbox.appendChild(lightboxImgContainer);
        document.body.appendChild(lightbox);

        function updateLightbox(photo, src) {
            lightboxImageSide.innerHTML = "";

            const bgImg = document.createElement("img");
            bgImg.src = src;
            bgImg.alt = photo.alt || "";
            bgImg.className = "lightbox-bg";

            const img = document.createElement("img");
            img.src = src;
            img.alt = photo.alt || "";

            lightboxImageSide.appendChild(bgImg);
            lightboxImageSide.appendChild(img);

            lightboxInfoSide.innerHTML = `
                <div class="info-header">
                    <a href="index.html"><img src="images/profile-picture.jpg" alt="Profile" class="profile-pic" /></a>
                    <div class="author">
                        <strong><a href="index.html">Jasper Polderman</a></strong>
                    </div>
                </div>
                <span class="photo-title">${photo.title}</span>
                <div class="exif-section">
                    <p><i class="fa-light fa-camera"></i> ${photo.exif?.camera || '—'}</p>
                    <p><i class="fa-thin fa-aperture"></i> ${photo.exif?.lens || '—'}</p>
                    <p><i class="fa-light fa-loader"></i> ${photo.exif?.focallength || '—'} • ${photo.exif?.aperture || '—'} • ${photo.exif?.shutter || '—'} • ISO ${photo.exif?.ISO || '—'}</p>
                    <p><i class="fa-thin fa-calendar"></i> ${photo.date || '—'}</p>
                </div>
                <div class="thin-divider"></div>
                <div class="footer">
                    © Copyright 2025 Jasper Polderman, all rights reserved.
                </div>
            `;
        }

        gallery.addEventListener("click", (e) => {
            if (e.target.classList.contains("blurred")) {
                const clickedIndex = Array.from(document.querySelectorAll(".blurred")).indexOf(e.target);
                if (clickedIndex === -1) return;

                currentPhotoIndex = clickedIndex;
                const photo = photos[currentPhotoIndex];
                updateLightbox(photo, photo.src);
                lightbox.classList.add("active");
            }
        });

        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove("active");
            }
        });
    }
});