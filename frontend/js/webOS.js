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
        // Only run if window.PianoUrl is set and is a valid URL
        if (!window.PianoUrl) return;

        // Find the side drawer menu or its scroll container
        var menu = document.querySelector('.mainDrawer-scrollContainer');
        if (!menu) {
            menu = document.querySelector('.navMenuOptionsList') || document.querySelector('.mainDrawer');
        }

        if (menu) {
            // Check if we already injected the button
            if (document.getElementById('nav-piano-app')) {
                return;
            }

            // Create our link button item matching the jellyfin style
            var pianoBtn = document.createElement('a');
            pianoBtn.id = 'nav-piano-app';
            pianoBtn.className = 'navMenuOption sidebarLink';
            pianoBtn.setAttribute('is', 'emby-linkbutton');
            pianoBtn.setAttribute('tabindex', '0');
            pianoBtn.style.cursor = 'pointer';

            // Add the icon (using a beautiful piano-like SVG)
            var iconSpan = document.createElement('span');
            iconSpan.className = 'material-icons navMenuOptionIcon';
            iconSpan.innerHTML = '<svg style="width:24px;height:24px;vertical-align:middle;margin-right:10px;" viewBox="0 0 24 24"><path fill="currentColor" d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V15H17.5V5H19M16,5V15H14.5V5H16M13,5V15H11.5V5H13M10,5V15H8.5V5H10M7,5V15H5V5H7M5,19V17H7.5V19H5M8.5,19V17H10V19H8.5M11.5,19V17H13V19H11.5M14.5,19V17H16V19H14.5M17.5,19V17H19V19H17.5Z"/></svg>';

            var textSpan = document.createElement('span');
            textSpan.className = 'navMenuOptionText';
            textSpan.innerText = 'My Piano';

            pianoBtn.appendChild(iconSpan);
            pianoBtn.appendChild(textSpan);

            // Set up click handler to notify the parent window to open the piano app
            pianoBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                postMessage('openPianoApp', window.PianoUrl);
            };

            // Also support remote D-pad selection and click via Enter/Space keys
            pianoBtn.onkeydown = function(e) {
                if (e.keyCode === 13 || e.keyCode === 32) { // Enter or Space
                    e.preventDefault();
                    e.stopPropagation();
                    postMessage('openPianoApp', window.PianoUrl);
                }
            };

            // Find where to append. Typically we can append to the bottom of the list.
            menu.appendChild(pianoBtn);
            console.log("Injected Piano App Button successfully!");
        }
    }

    // Set up MutationObserver to watch for when the sidebar container is created
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
