#!/bin/sh
# CPUDoc uninstaller - removes the root helper and polkit policy.
# Run with sudo:  sudo ./uninstall.sh
set -eu

HELPER_DST=/usr/local/lib/cpudoc/cpudoc-apply
POLICY_DST=/usr/share/polkit-1/actions/io.cpudoc.policy

echo "==> Removing polkit policy"
rm -f "$POLICY_DST"

echo "==> Removing helper"
rm -f "$HELPER_DST"
rmdir /usr/local/lib/cpudoc 2>/dev/null || true

echo "==> Removing RAPL udev rule"
rm -f /etc/udev/rules.d/99-cpudoc-powercap.rules
udevadm trigger --subsystem-match=powercap 2>/dev/null || true

if command -v systemctl >/dev/null 2>&1; then
    systemctl restart polkit.service 2>/dev/null || true
fi

echo "OK. CPUDoc privileges removed."