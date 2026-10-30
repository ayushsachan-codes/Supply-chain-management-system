/**
 * SupplyChainPro - Utility Helpers & Export Tools
 */

const Utils = {
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(amount || 0);
    },

    formatNumber(num) {
        return new Intl.NumberFormat('en-US').format(num || 0);
    },

    getStatusBadge(status) {
        if (!status) status = 'Planned';
        const cleanStatus = status.toLowerCase().replace(/\s+/g, '');
        let badgeClass = 'badge-planned';

        if (cleanStatus.includes('progress')) badgeClass = 'badge-inprogress';
        else if (cleanStatus.includes('pending')) badgeClass = 'badge-pending';
        else if (cleanStatus.includes('completed')) badgeClass = 'badge-completed';
        else if (cleanStatus.includes('delayed')) badgeClass = 'badge-delayed';
        else if (cleanStatus.includes('planned')) badgeClass = 'badge-planned';

        return `<span class="status-badge ${badgeClass}">${status}</span>`;
    },

    getRatingStars(rating) {
        const score = parseFloat(rating) || 0;
        const fullStars = Math.floor(score);
        const hasHalf = score % 1 >= 0.5;
        let starsHtml = '';

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                starsHtml += '<i class="ri-star-fill"></i>';
            } else if (i === fullStars + 1 && hasHalf) {
                starsHtml += '<i class="ri-star-half-fill"></i>';
            } else {
                starsHtml += '<i class="ri-star-line"></i>';
            }
        }

        return `
            <div class="rating-stars">
                ${starsHtml}
                <span class="rating-score">${score.toFixed(1)}</span>
            </div>
        `;
    },

    exportToCSV(filename, rows, headers) {
        let csvContent = 'data:text/csv;charset=utf-8,';
        if (headers && headers.length > 0) {
            csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\r\n';
        }

        rows.forEach(row => {
            const rowStr = row.map(val => {
                const str = String(val === undefined || val === null ? '' : val);
                return `"${str.replace(/"/g, '""')}"`;
            }).join(',');
            csvContent += rowStr + '\r\n';
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.notifications.showToast('Export Complete', `${filename}.csv has been downloaded successfully.`, 'success');
    },

    printReport() {
        window.print();
    },

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

window.Utils = Utils;

