#!/bin/sh
# CPUDoc installer - installs the root helper and polkit policy.
# Run with sudo:  sudo ./install.sh
set -eu

HELPER_DST=/usr/local/lib/cpudoc/cpudoc-apply
POLICY_DST=/usr/share/polkit-1/actions/io.cpudoc.policy

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

echo "==> Installing CPUDoc privilege helper"
install -d /usr/local/lib/cpudoc
install -m 0755 "$SCRIPT_DIR/resources/cpudoc-apply" "$HELPER_DST"

echo "==> Installing polkit policy"
install -d /usr/share/polkit-1/actions
install -m 0644 "$SCRIPT_DIR/resources/io.cpudoc.policy" "$POLICY_DST"

echo "==> Enabling unprivileged RAPL power reads"
install -m 0644 "$SCRIPT_DIR/resources/99-cpudoc-powercap.rules" /etc/udev/rules.d/99-cpudoc-powercap.rules
for f in /sys/class/powercap/*/energy_uj; do
    chmod 0444 "$f" 2>/dev/null || true
done
udevadm trigger --subsystem-match=powercap 2>/dev/null || true

echo "==> Reloading polkit"
if command -v systemctl >/dev/null 2>&1; then
    systemctl restart polkit.service 2>/dev/null || true
fi

echo "OK. Helper: $HELPER_DST"
echo "    Policy: $POLICY_DST"