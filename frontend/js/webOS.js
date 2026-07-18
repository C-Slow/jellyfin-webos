/* 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
*/

(function(AppInfo, deviceInfo) {
    'use strict';

    console.log('WebOS adapter');

    function postMessage(type, data) {
        window.top.postMessage({
            type: type,
            data: data
        }, '*');
    }

    // List of supported features
    var SupportedFeatures = [
        'exit',
        'externallinkdisplay',
        'htmlaudioautoplay',
        'htmlvideoautoplay',
        'imageanalysis',
        'physicalvolumecontrol',
        'displaylanguage',
        'otherapppromotions',
        'targetblank',
        'screensaver',
        'subtitleappearancesettings',
        'subtitleburnsettings',
        'chromecast',
        'multiserver'
    ];

    window.NativeShell = {
        AppHost: {
            init: function () {
                postMessage('AppHost.init', AppInfo);
                return Promise.resolve(AppInfo);
            },

            appName: function () {
                postMessage('AppHost.appName', AppInfo.appName);
                return AppInfo.appName;
            },

            appVersion: function () {
                postMessage('AppHost.appVersion', AppInfo.appVersion);
                return AppInfo.appVersion;
            },

            deviceId: function () {
                postMessage('AppHost.deviceId', AppInfo.deviceId);
                return AppInfo.deviceId;
            },

            deviceName: function () {
                postMessage('AppHost.deviceName', AppInfo.deviceName);
                return AppInfo.deviceName;
            },

            exit: function () {
                postMessage('AppHost.exit');
            },

            getDefaultLayout: function () {
                postMessage('AppHost.getDefaultLayout', 'tv');
                return 'tv';
            },

            getDeviceProfile: function (profileBuilder) {
                postMessage('AppHost.getDeviceProfile');
                return profileBuilder({
                    enableMkvProgressive: false,
                    enableSsaRender: true,
                    supportsDolbyAtmos: deviceInfo ? deviceInfo.dolbyAtmos : null,
                    supportsDolbyVision: deviceInfo ? deviceInfo.dolbyVision : null,
                    supportsHdr10: deviceInfo ? deviceInfo.hdr10 : null
                });
            },

            getSyncProfile: function (profileBuilder) {
                postMessage('AppHost.getSyncProfile');
                return profileBuilder({ enableMkvProgressive: false });
            },

            supports: function (command) {
                var isSupported = command && SupportedFeatures.indexOf(command.toLowerCase()) != -1;
                postMessage('AppHost.supports', {
                    command: command,
                    isSupported: isSupported
                });
                return isSupported;
            },

            screen: function () {
                return deviceInfo ? {
                    width: deviceInfo.screenWidth,
                    height: deviceInfo.screenHeight
                } : null;
            }
        },

        selectServer: function () {
            postMessage('selectServer');
        },

        downloadFile: function (url) {
            postMessage('downloadFile', { url: url });
        },

        enableFullscreen: function () {
            postMessage('enableFullscreen');
        },

        disableFullscreen: function () {
            postMessage('disableFullscreen');
        },

        getPlugins: function () {
            postMessage('getPlugins');
            return [];
        },

        openUrl: function (url, target) {
            postMessage('openUrl', {
                url: url,
                target: target
            });
        },

        updateMediaSession: function (mediaInfo) {
            postMessage('updateMediaSession', { mediaInfo: mediaInfo });
        },

        hideMediaSession: function () {
            postMessage('hideMediaSession');
        }
    };

    // Custom button injection for Piano app
    function injectPianoButton() {
        if (!window.PianoUrl) return;

        // 1. Sidebar/Drawer Injection
        var menu = document.querySelector('.mainDrawer-scrollContainer');
        if (!menu) {
            menu = document.querySelector('.navMenuOptionsList') || document.querySelector('.mainDrawer');
        }

        if (menu && !document.getElementById('nav-piano-app')) {
            var pianoBtn = document.createElement('a');
            pianoBtn.id = 'nav-piano-app';
            pianoBtn.className = 'navMenuOption sidebarLink';
            pianoBtn.setAttribute('is', 'emby-linkbutton');
            pianoBtn.setAttribute('tabindex', '0');
            pianoBtn.style.cursor = 'pointer';

            var iconSpan = document.createElement('span');
            iconSpan.className = 'material-icons navMenuOptionIcon';
            iconSpan.innerHTML = '<svg style="width:24px;height:24px;vertical-align:middle;margin-right:10px;" viewBox="0 0 24 24"><path fill="currentColor" d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V15H17.5V5H19M16,5V15H14.5V5H16M13,5V15H11.5V5H13M10,5V15H8.5V5H10M7,5V15H5V5H7M5,19V17H7.5V19H5M8.5,19V17H10V19H8.5M11.5,19V17H13V19H11.5M14.5,19V17H16V19H14.5M17.5,19V17H19V19H17.5Z"/></svg>';

            var textSpan = document.createElement('span');
            textSpan.className = 'navMenuOptionText';
            textSpan.innerText = 'My Piano';

            pianoBtn.appendChild(iconSpan);
            pianoBtn.appendChild(textSpan);

            pianoBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                postMessage('openPianoApp', window.PianoUrl);
            };

            pianoBtn.onkeydown = function(e) {
                if (e.keyCode === 13 || e.keyCode === 32) {
                    e.preventDefault();
                    e.stopPropagation();
                    postMessage('openPianoApp', window.PianoUrl);
                }
            };

            menu.appendChild(pianoBtn);
            console.log("Injected Piano App Sidebar Button successfully!");
        }

        // 2. Top-Right Header Toolbar Injection (Supports Desktop and TV layout headers)
        var header = document.querySelector('.headerButtons') || document.querySelector('.headerButtons-right') || document.querySelector('.headerButtons-left');
        if (header && !document.getElementById('header-piano-app')) {
            var headerBtn = document.createElement('button');
            headerBtn.id = 'header-piano-app';
            headerBtn.type = 'button';
            headerBtn.className = 'headerButton emby-button';
            headerBtn.setAttribute('title', 'My Piano');
            headerBtn.setAttribute('tabindex', '0');
            headerBtn.style.cursor = 'pointer';
            headerBtn.style.background = 'none';
            headerBtn.style.border = 'none';
            headerBtn.style.color = 'inherit';
            headerBtn.style.padding = '0 10px';
            headerBtn.style.height = '100%';
            headerBtn.style.display = 'inline-flex';
            headerBtn.style.alignItems = 'center';
            headerBtn.style.justifyContent = 'center';

            headerBtn.innerHTML = '<svg style="width:24px;height:24px;vertical-align:middle;" viewBox="0 0 24 24"><path fill="currentColor" d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V15H17.5V5H19M16,5V15H14.5V5H16M13,5V15H11.5V5H13M10,5V15H8.5V5H10M7,5V15H5V5H7M5,19V17H7.5V19H5M8.5,19V17H10V19H8.5M11.5,19V17H13V19H11.5M14.5,19V17H16V19H14.5M17.5,19V17H19V19H17.5Z"/></svg>';

            headerBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                postMessage('openPianoApp', window.PianoUrl);
            };

            headerBtn.onkeydown = function(e) {
                if (e.keyCode === 13 || e.keyCode === 32) {
                    e.preventDefault();
                    e.stopPropagation();
                    postMessage('openPianoApp', window.PianoUrl);
                }
            };

            header.insertBefore(headerBtn, header.firstChild);
            console.log("Injected Piano App Header Button successfully!");
        }
    }

    // 3. Remote Control Hotkeys Event Listener (Red: 403, Green: 404, Yellow: 405, Blue: 406, Play: 415, Pause: 19)
    document.addEventListener('keydown', function(e) {
        if (!window.PianoUrl) return;
        var triggerKeys = [403, 404, 405, 406, 415, 19];
        if (triggerKeys.indexOf(e.keyCode) !== -1) {
            e.preventDefault();
            e.stopPropagation();
            postMessage('openPianoApp', window.PianoUrl);
        }
    });

    // Set up MutationObserver to watch for when the sidebar or header container is created/rendered
    var observer = new MutationObserver(function(mutations) {
        injectPianoButton();
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    // Also run immediately on script load
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        injectPianoButton();
    } else {
        document.addEventListener('DOMContentLoaded', injectPianoButton);
    }
})(window.AppInfo, window.DeviceInfo);
