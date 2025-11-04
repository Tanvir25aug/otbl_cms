const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

class TelegramService {
    constructor() {
        this.baseUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
    }

    /**
     * Send a message to Telegram
     * @param {string} message - The message to send
     * @param {object} options - Additional options (parse_mode, etc.)
     */
    async sendMessage(message, options = {}) {
        try {
            if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
                console.log('Telegram bot not configured. Skipping notification.');
                return null;
            }

            const payload = {
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: options.parse_mode || 'HTML',
                disable_web_page_preview: options.disable_preview || true,
                ...options
            };

            const response = await axios.post(`${this.baseUrl}/sendMessage`, payload);
            return response.data;
        } catch (error) {
            console.error('Error sending Telegram message:', error.response?.data || error.message);
            return null;
        }
    }

    /**
     * Send complaint notification
     * @param {object} complaint - Complaint object
     * @param {string} action - Action type (created, updated, closed, etc.)
     * @param {object} additionalData - Additional data (billing profile, missing months, etc.)
     */
    async sendComplaintNotification(complaint, action = 'created', additionalData = {}) {
        const statusEmoji = {
            'Open': '🔴',
            'In Progress': '🟡',
            'Close': '🟢'
        };

        const actionEmoji = {
            'created': '📝',
            'updated': '✏️',
            'closed': '✅',
            'auto-closed': '🤖'
        };

        let message = `${actionEmoji[action] || '📢'} <b>Complaint ${action.toUpperCase()}</b>\n\n`;
        message += `🆔 <b>Complaint ID:</b> #${complaint.id}\n`;
        message += `${statusEmoji[complaint.status] || '⚪'} <b>Status:</b> ${complaint.status}\n`;
        message += `👤 <b>Customer ID:</b> ${complaint.customerId}\n`;

        if (complaint.customerInfo?.CustomerName) {
            message += `📛 <b>Customer Name:</b> ${complaint.customerInfo.CustomerName}\n`;
        }

        message += `📞 <b>Mobile:</b> ${complaint.customerInfo?.Mobile || 'N/A'}\n`;
        message += `⚡ <b>Meter No:</b> ${complaint.meterNumber}\n`;

        if (complaint.ComplaintCategory?.name) {
            message += `📋 <b>Category:</b> ${complaint.ComplaintCategory.name}\n`;
        }

        if (complaint.agent?.fullName) {
            message += `👨‍💼 <b>Assigned To:</b> ${complaint.agent.fullName}\n`;
        }

        // Connection Details
        if (complaint.customerInfo) {
            message += `\n⚡ <b>Connection Details:</b>\n`;
            message += `   • Tariff: ${complaint.customerInfo.Tariff || 'N/A'}\n`;
            message += `   • Phase: ${complaint.customerInfo.Phase || 'N/A'}\n`;
            message += `   • Sanction Load: ${complaint.customerInfo.SanctionLoad || 'N/A'}\n`;
            if (complaint.customerInfo.ConnectionDate) {
                message += `   • Connection Date: ${new Date(complaint.customerInfo.ConnectionDate).toLocaleDateString()}\n`;
            } else {
                message += `   • Connection Date: N/A\n`;
            }
        }

        // Location
        if (complaint.customerInfo) {
            message += `\n📍 <b>Location:</b>\n`;
            message += `   • Address: ${complaint.customerInfo.Address || 'N/A'}\n`;
            message += `   • NOCS: ${complaint.customerInfo.NOCSName || 'N/A'}\n`;
            message += `   • Feeder: ${complaint.customerInfo.FeederName || complaint.customerInfo.FeederNo || 'N/A'}\n`;
        }

        // BILL STOP SPECIFIC INFORMATION
        if (complaint.ComplaintCategory?.name === 'Bill Stop' && additionalData) {
            message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
            message += `📊 <b>BILLING ANALYSIS</b>\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

            // Last bill date info
            if (complaint.customerInfo?.LastBillDate) {
                const lastBillDate = new Date(complaint.customerInfo.LastBillDate);
                message += `📅 <b>Last Bill Date:</b> ${lastBillDate.toLocaleDateString()}\n`;
                message += `📊 <b>Analysis Period:</b> After last bill to current\n\n`;
            } else {
                message += `⚠️ <b>Last Bill Date:</b> Not Available\n`;
                message += `📊 <b>Analysis Period:</b> From connection to current\n\n`;
            }

            // Total readings available
            if (additionalData.totalReadings !== undefined) {
                message += `📈 <b>Total Readings:</b> ${additionalData.totalReadings}\n`;
            }

            // Covered months (AFTER last bill date)
            if (additionalData.coveredMonths && additionalData.coveredMonths.length > 0) {
                message += `✅ <b>Covered Months After Last Bill (${additionalData.coveredMonths.length}):</b>\n`;
                message += `   ${additionalData.coveredMonths.slice(0, 6).join(', ')}`;
                if (additionalData.coveredMonths.length > 6) {
                    message += ` +${additionalData.coveredMonths.length - 6} more`;
                }
                message += `\n\n`;
            }

            // Missing months - CRITICAL INFORMATION (AFTER last bill date)
            if (additionalData.missingMonths && additionalData.missingMonths.length > 0) {
                message += `❌ <b>MISSING MONTHS After Last Bill (${additionalData.missingMonths.length}):</b>\n`;
                message += `   ${additionalData.missingMonths.join(', ')}\n\n`;

                // FIELD VISIT ASSIGNMENT
                message += `🚨 <b>FIELD VISIT REQUIRED!</b>\n`;
                message += `━━━━━━━━━━━━━━━━━━━━\n`;
                message += `📍 <b>Action Required:</b>\n`;
                message += `   • Visit customer location\n`;
                message += `   • Check meter condition\n`;
                message += `   • Take manual readings if possible\n`;
                message += `   • Verify meter communication\n`;
                message += `   • Report findings\n\n`;

                message += `📋 <b>Missing Data For:</b> ${additionalData.missingMonths.join(', ')}\n\n`;
            } else if (additionalData.totalReadings === 0) {
                // NO READINGS AT ALL
                message += `⚠️ <b>NO READINGS AVAILABLE!</b>\n\n`;
                message += `🚨 <b>URGENT FIELD VISIT REQUIRED!</b>\n`;
                message += `━━━━━━━━━━━━━━━━━━━━\n`;
                message += `📍 <b>Priority Actions:</b>\n`;
                message += `   • Immediate site visit needed\n`;
                message += `   • Verify meter installation\n`;
                message += `   • Check meter communication\n`;
                message += `   • Test meter functionality\n`;
                message += `   • Submit initial reading\n\n`;
            }

            // Current month reading status
            if (additionalData.currentMonthReading === false) {
                message += `⚠️ <b>Current Month:</b> No reading available\n`;
                message += `📅 <b>Action:</b> Submit reading for current month\n\n`;
            } else if (additionalData.currentMonthReading === true) {
                message += `✅ <b>Current Month:</b> Reading available\n\n`;
            }

            // Meter replacement info
            if (additionalData.hasReplacement) {
                message += `🔄 <b>Meter Replacement Detected!</b>\n`;
                if (additionalData.replacementDate) {
                    message += `📅 <b>Replacement Date:</b> ${additionalData.replacementDate}\n`;
                }
                if (additionalData.oldMeter && additionalData.newMeter) {
                    message += `🔢 <b>Old Meter:</b> ${additionalData.oldMeter}\n`;
                    message += `🔢 <b>New Meter:</b> ${additionalData.newMeter}\n`;
                }
                message += `\n`;
            }

            // Address for field visit
            if (complaint.customerInfo?.Address) {
                message += `🏠 <b>Visit Address:</b>\n   ${complaint.customerInfo.Address}\n\n`;
            }

            // Feeder information
            if (complaint.customerInfo?.FeederName) {
                message += `⚡ <b>Feeder:</b> ${complaint.customerInfo.FeederName} (${complaint.customerInfo.FeederNo || 'N/A'})\n`;
            }
        }

        if (complaint.issueDescription) {
            const description = complaint.issueDescription
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .substring(0, 200); // Limit length
            message += `\n📝 <b>Description:</b>\n${description}${complaint.issueDescription.length > 200 ? '...' : ''}\n`;
        }

        message += `\n🕐 <b>Created:</b> ${new Date(complaint.createdAt).toLocaleString()}\n`;

        if (action === 'auto-closed') {
            message += `\n🤖 <i>Auto-closed: Bill Stop complaint with current month bill date</i>`;
        }

        // Add priority indicator for missing reads
        if (additionalData.missingMonths && additionalData.missingMonths.length > 3) {
            message += `\n\n🔴 <b>HIGH PRIORITY - Multiple months missing!</b>`;
        } else if (additionalData.totalReadings === 0) {
            message += `\n\n🔴 <b>CRITICAL - No billing data available!</b>`;
        }

        return await this.sendMessage(message);
    }

    /**
     * Send daily summary
     * @param {object} summary - Summary data
     */
    async sendDailySummary(summary) {
        let message = `📊 <b>Daily Complaints Summary</b>\n\n`;
        message += `📈 <b>Total Complaints:</b> ${summary.total}\n`;
        message += `🔴 <b>Open:</b> ${summary.open}\n`;
        message += `🟡 <b>In Progress:</b> ${summary.inProgress}\n`;
        message += `🟢 <b>Closed:</b> ${summary.closed}\n\n`;

        if (summary.byCategory && summary.byCategory.length > 0) {
            message += `📋 <b>Top Categories:</b>\n`;
            summary.byCategory.forEach((cat, index) => {
                message += `${index + 1}. ${cat.name}: ${cat.count}\n`;
            });
        }

        return await this.sendMessage(message);
    }

    /**
     * Send alert for old complaints
     * @param {array} complaints - Array of old complaints
     */
    async sendOverdueAlert(complaints) {
        let message = `⚠️ <b>OVERDUE COMPLAINTS ALERT</b>\n\n`;
        message += `Found ${complaints.length} complaint(s) pending for more than 48 hours:\n\n`;

        complaints.forEach((complaint, index) => {
            const hoursOld = Math.floor((Date.now() - new Date(complaint.createdAt)) / (1000 * 60 * 60));
            message += `${index + 1}. #${complaint.id} - ${complaint.customerId}\n`;
            message += `   ⏰ ${hoursOld} hours old\n`;
            message += `   📋 ${complaint.ComplaintCategory?.name || 'N/A'}\n\n`;
        });

        message += `Please take action immediately! 🚨`;

        return await this.sendMessage(message);
    }

    /**
     * Send billing profile upload confirmation
     * @param {object} processResult - Result from reading processor
     */
    async sendBillingProfileUploadConfirmation(processResult) {
        const { meterNo, totalExtracted, newSaved, duplicatesSkipped, savedReadings } = processResult;

        let message = `📄 <b>BILLING PROFILE PROCESSED</b>\n\n`;
        message += `⚡ <b>Meter Number:</b> ${meterNo}\n\n`;

        message += `📊 <b>EXTRACTION SUMMARY</b>\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n`;
        message += `📈 <b>Total Readings Extracted:</b> ${totalExtracted}\n`;
        message += `✅ <b>New Readings Saved:</b> ${newSaved}\n`;
        message += `⏭️ <b>Duplicates Skipped:</b> ${duplicatesSkipped}\n\n`;

        if (newSaved > 0) {
            message += `💾 <b>SAVED READINGS (${newSaved})</b>\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n`;

            // Show first 5 saved readings
            const readingsToShow = savedReadings.slice(0, 5);
            readingsToShow.forEach((reading, index) => {
                const date = new Date(reading.date);
                message += `${index + 1}. <b>${date.toLocaleDateString()}</b>\n`;
                message += `   📊 Total: ${reading.total_energy.toFixed(2)} kWh\n`;
                message += `   🔹 TOD1: ${reading.tod1_energy.toFixed(2)} kWh\n`;
                message += `   🔸 TOD2: ${reading.tod2_energy.toFixed(2)} kWh\n\n`;
            });

            if (savedReadings.length > 5) {
                message += `   ... and ${savedReadings.length - 5} more readings\n\n`;
            }

            // Add date range
            const dates = savedReadings.map(r => new Date(r.date));
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            message += `📅 <b>Date Range:</b> ${minDate.toLocaleDateString()} to ${maxDate.toLocaleDateString()}\n\n`;
        }

        if (duplicatesSkipped > 0) {
            message += `ℹ️ <i>${duplicatesSkipped} reading(s) already existed in database and were skipped</i>\n\n`;
        }

        if (newSaved > 0) {
            message += `✅ <b>Database updated successfully!</b>`;
        } else {
            message += `⚠️ <b>No new readings to save. All readings already exist in database.</b>`;
        }

        return await this.sendMessage(message);
    }

    /**
     * Send error message for failed PDF processing
     * @param {string} error - Error message
     * @param {string} fileName - PDF file name (optional)
     */
    async sendPDFProcessingError(error, fileName = '') {
        let message = `❌ <b>BILLING PROFILE PROCESSING FAILED</b>\n\n`;

        if (fileName) {
            message += `📄 <b>File:</b> ${fileName}\n\n`;
        }

        message += `🚫 <b>Error:</b> ${error}\n\n`;
        message += `💡 <b>Please check:</b>\n`;
        message += `   • File is a valid Billing Profile PDF\n`;
        message += `   • PDF contains meter number\n`;
        message += `   • PDF contains billing dates and readings\n`;
        message += `   • PDF is not corrupted or password protected\n`;

        return await this.sendMessage(message);
    }

    /**
     * Download file from Telegram
     * @param {string} fileId - Telegram file ID
     * @returns {Promise<Buffer>} File buffer
     */
    async downloadFile(fileId) {
        try {
            if (!TELEGRAM_BOT_TOKEN) {
                throw new Error('Telegram bot not configured');
            }

            // Get file path from Telegram
            const fileInfoResponse = await axios.get(`${this.baseUrl}/getFile`, {
                params: { file_id: fileId }
            });

            const filePath = fileInfoResponse.data.result.file_path;
            const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;

            // Download file
            const fileResponse = await axios.get(fileUrl, {
                responseType: 'arraybuffer'
            });

            return Buffer.from(fileResponse.data);

        } catch (error) {
            console.error('Error downloading file from Telegram:', error);
            throw error;
        }
    }
}

module.exports = new TelegramService();
