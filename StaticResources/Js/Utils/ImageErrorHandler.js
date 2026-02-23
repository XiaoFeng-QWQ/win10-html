"use strict";

const ImageErrorHandler = {
    defaultIcon: '/StaticResources/Icons/15.ico',

    init: function () {
        this.setupGlobalHandler();
        this.setupMutationObserver();
        this.checkExistingImages();
    },

    setupGlobalHandler: function () {
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                this.handleError(e.target);
            }
        }, true);
    },

    setupMutationObserver: function () {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    this.checkNodeForImages(node);
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    },

    checkNodeForImages: function (node) {
        if (node.nodeName === 'IMG') {
            this.attachHandler(node);
        } else if (node.nodeType === 1) {
            $(node).find('img').each((_, img) => {
                this.attachHandler(img);
            });
        }
    },

    attachHandler: function (img) {
        $(img).off('error').on('error', () => this.handleError(img));
        if (img.complete && img.naturalWidth === 0) {
            this.handleError(img);
        }
    },

    checkExistingImages: function () {
        $('img').each((_, img) => {
            if (img.complete && img.naturalWidth === 0) {
                this.handleError(img);
            }
        });
    },

    handleError: function (img) {
        if (img.src.includes('unknown.png') || img.hasAttribute('data-error-handled')) {
            return;
        }

        img.setAttribute('data-error-handled', 'true');
        img.src = this.defaultIcon;
        img.classList.add('img-load-error');
    }
};

export { ImageErrorHandler };