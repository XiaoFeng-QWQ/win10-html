// Main.js
"use strict";

import { ContextMenuManager } from "./Manager/ContextMenuManager.js";
import { DesktopManager } from "./Manager/DesktopManager.js";
import { MessageBoxManager } from "./Manager/MessageBoxManager.js";
import { WindowManager } from "./Manager/WindowManager.js";

// 使MessageBoxManager全局可用
window.MessageBoxManager = MessageBoxManager;
window.WindowManager = WindowManager;

// 全局图片加载错误处理
function setupImageErrorHandler() {
    // 使用事件委托监听所有图片的error事件
    document.addEventListener('error', function (e) {
        const target = e.target;
        if (target.tagName === 'IMG') {
            handleImageError(target);
        }
    }, true); // 使用捕获阶段以确保能捕获到

    // 对于动态添加的图片，确保已经存在的图片也有处理
    $('img').each(function () {
        const $img = $(this);
        // 检查图片是否已经加载失败
        if (this.complete && this.naturalWidth === 0) {
            handleImageError(this);
        }
    });
}

// 图片错误处理函数
function handleImageError(img) {
    // 避免无限循环
    if (img.src.includes('unknown.png') || img.hasAttribute('data-error-handled')) {
        return;
    }

    // 标记已处理
    img.setAttribute('data-error-handled', 'true');

    // 记录错误信息（可选）
    console.warn(`图片加载失败: ${img.src}，使用默认图片替代`);

    // 替换为unknown.png
    img.src = 'StaticResources/Icons/unknown.png';

    // 可选：添加一个类以便样式化
    img.classList.add('img-load-error');
}

// 监听动态添加的图片
function observeNewImages() {
    // 使用MutationObserver监听DOM变化
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
                if (node.nodeName === 'IMG') {
                    // 新添加的img元素
                    $(node).on('error', function () {
                        handleImageError(this);
                    });

                    // 检查是否已经加载失败
                    if (node.complete && node.naturalWidth === 0) {
                        handleImageError(node);
                    }
                } else if (node.nodeType === 1) {
                    // 新添加的元素内部可能包含img
                    $(node).find('img').each(function () {
                        const img = this;
                        $(img).off('error').on('error', function () {
                            handleImageError(this);
                        });

                        if (img.complete && img.naturalWidth === 0) {
                            handleImageError(img);
                        }
                    });
                }
            });
        });
    });

    // 观察整个document
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

$(document).ready(function () {
    DesktopManager.init();
    ContextMenuManager.init();

    // 设置图片错误处理
    setupImageErrorHandler();
    observeNewImages();
});