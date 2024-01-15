function showImage() {
    let imageSrc = galleryImages[currentImageIndex].src;
    let popupImage = document.getElementById("popupImage");
    popupImage.src = imageSrc;
    
    let imagePopup = document.getElementById("imagePopup");
    imagePopup.style.display = "block";
    document.body.style.overflow = "hidden";
}


function closeImage() {
    let imagePopup = document.getElementById("imagePopup");
    imagePopup.style.display = "none";
   document.body.style.overflow = "auto";
  }


let currentImageIndex = 0;
let galleryImages = [];

document.addEventListener('DOMContentLoaded', function() {
    galleryImages = Array.from(document.querySelectorAll('.gallery-img'));

    galleryImages.forEach(function(img, index) {
        img.addEventListener('click', function() {
            currentImageIndex = index;
            showImage();
        });
    });

    document.getElementById('prevButton').addEventListener('click', function() {
        if (currentImageIndex > 0) {
            currentImageIndex--;
            showImage();
        }
    });

    document.getElementById('nextButton').addEventListener('click', function() {
        if (currentImageIndex < galleryImages.length - 1) {
            currentImageIndex++;
            showImage();
        }
    });


    // Handling the CTA button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            console.log('CTA button clicked!');
        });
    }

    
});





// function to show image when we click on a image
