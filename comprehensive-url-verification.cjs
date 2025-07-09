const fs = require('fs');
const https = require('https');
const http = require('http');
const { URL } = require('url');

class URLVerificationSystem {
    constructor() {
        this.results = {
            working: [],
            broken: [],
            timeout: [],
            redirect: [],
            total: 0
        };
        this.batchSize = 10; // Process in small batches to avoid timeouts
        this.requestTimeout = 8000; // 8 second timeout per request
        this.maxRetries = 2;
    }

    async verifyURL(url, retryCount = 0) {
        return new Promise((resolve) => {
            try {
                const urlObj = new URL(url);
                const isHttps = urlObj.protocol === 'https:';
                const client = isHttps ? https : http;
                
                const options = {
                    hostname: urlObj.hostname,
                    port: urlObj.port || (isHttps ? 443 : 80),
                    path: urlObj.pathname + urlObj.search,
                    method: 'HEAD',
                    timeout: this.requestTimeout,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                };

                const req = client.request(options, (res) => {
                    const statusCode = res.statusCode;
                    
                    if (statusCode >= 200 && statusCode < 300) {
                        resolve({ status: 'working', code: statusCode, url });
                    } else if (statusCode >= 300 && statusCode < 400 && res.headers.location) {
                        resolve({ status: 'redirect', code: statusCode, url, redirect: res.headers.location });
                    } else if (statusCode === 404) {
                        resolve({ status: 'not_found', code: statusCode, url });
                    } else {
                        resolve({ status: 'error', code: statusCode, url });
                    }
                });

                req.on('timeout', () => {
                    req.destroy();
                    if (retryCount < this.maxRetries) {
                        setTimeout(() => {
                            this.verifyURL(url, retryCount + 1).then(resolve);
                        }, 1000);
                    } else {
                        resolve({ status: 'timeout', url });
                    }
                });

                req.on('error', (error) => {
                    if (retryCount < this.maxRetries) {
                        setTimeout(() => {
                            this.verifyURL(url, retryCount + 1).then(resolve);
                        }, 1000);
                    } else {
                        resolve({ status: 'error', url, error: error.message });
                    }
                });

                req.end();
                
            } catch (error) {
                resolve({ status: 'invalid', url, error: error.message });
            }
        });
    }

    async processBatch(opportunities, batchIndex, totalBatches) {
        console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (${opportunities.length} URLs)...`);
        
        const promises = opportunities.map(async (opp) => {
            const result = await this.verifyURL(opp.url);
            return { ...result, id: opp.id, title: opp.title, organization: opp.organization };
        });

        const results = await Promise.all(promises);
        
        // Categorize results
        results.forEach(result => {
            this.results.total++;
            
            if (result.status === 'working') {
                this.results.working.push(result);
            } else if (result.status === 'redirect') {
                this.results.redirect.push(result);
            } else if (result.status === 'timeout') {
                this.results.timeout.push(result);
            } else {
                this.results.broken.push(result);
            }
        });

        // Progress update
        const workingCount = this.results.working.length;
        const brokenCount = this.results.broken.length + this.results.timeout.length;
        const redirectCount = this.results.redirect.length;
        
        console.log(`✅ Batch ${batchIndex + 1} complete: ${workingCount} working, ${brokenCount} broken, ${redirectCount} redirects`);
        
        return results;
    }

    async getAllOpportunities() {
        try {
            const response = await fetch('http://localhost:5000/api/opportunities');
            if (!response.ok) {
                throw new Error(`Failed to fetch opportunities: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching opportunities:', error);
            return [];
        }
    }

    async verifyAllURLs() {
        console.log('=== COMPREHENSIVE URL VERIFICATION SYSTEM ===');
        console.log('🔍 Fetching all opportunities from database...');
        
        const allOpportunities = await this.getAllOpportunities();
        
        if (allOpportunities.length === 0) {
            console.log('❌ No opportunities found or failed to fetch from database');
            return;
        }

        console.log(`📊 Found ${allOpportunities.length} opportunities to verify`);
        
        // Filter for Web Research 2025 opportunities
        const webResearchOpps = allOpportunities.filter(opp => 
            opp.source && opp.source.includes('Web Research 2025')
        );
        
        console.log(`🎯 Found ${webResearchOpps.length} 'Web Research 2025' opportunities to verify`);
        
        if (webResearchOpps.length === 0) {
            console.log('ℹ️ No Web Research 2025 opportunities found, checking all opportunities instead...');
            var opportunitiesToCheck = allOpportunities;
        } else {
            var opportunitiesToCheck = webResearchOpps;
        }

        // Create batches
        const batches = [];
        for (let i = 0; i < opportunitiesToCheck.length; i += this.batchSize) {
            batches.push(opportunitiesToCheck.slice(i, i + this.batchSize));
        }

        console.log(`⚡ Processing ${opportunitiesToCheck.length} URLs in ${batches.length} batches of ${this.batchSize}...`);
        
        // Process batches with delay between them
        for (let i = 0; i < batches.length; i++) {
            await this.processBatch(batches[i], i, batches.length);
            
            // Small delay between batches to prevent overwhelming servers
            if (i < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        // Generate final report
        this.generateReport();
        await this.saveBrokenURLsToFile();
        
        return this.results;
    }

    generateReport() {
        console.log('\n=== COMPREHENSIVE URL VERIFICATION RESULTS ===');
        console.log(`📊 Total URLs verified: ${this.results.total}`);
        console.log(`✅ Working URLs: ${this.results.working.length} (${Math.round((this.results.working.length / this.results.total) * 100)}%)`);
        console.log(`🔄 Redirect URLs: ${this.results.redirect.length} (${Math.round((this.results.redirect.length / this.results.total) * 100)}%)`);
        console.log(`❌ Broken URLs: ${this.results.broken.length} (${Math.round((this.results.broken.length / this.results.total) * 100)}%)`);
        console.log(`⏰ Timeout URLs: ${this.results.timeout.length} (${Math.round((this.results.timeout.length / this.results.total) * 100)}%)`);
        
        if (this.results.broken.length > 0) {
            console.log('\n🚨 BROKEN URLs FOUND:');
            this.results.broken.forEach((item, index) => {
                console.log(`${index + 1}. [ID: ${item.id}] ${item.title} - ${item.organization}`);
                console.log(`   URL: ${item.url}`);
                console.log(`   Status: ${item.status} (${item.code || 'No code'})`);
                console.log('');
            });
        }

        if (this.results.timeout.length > 0) {
            console.log('\n⏰ TIMEOUT URLs:');
            this.results.timeout.forEach((item, index) => {
                console.log(`${index + 1}. [ID: ${item.id}] ${item.title} - ${item.organization}`);
                console.log(`   URL: ${item.url}`);
                console.log('');
            });
        }
    }

    async saveBrokenURLsToFile() {
        const brokenURLsData = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.results.total,
                working: this.results.working.length,
                broken: this.results.broken.length,
                timeout: this.results.timeout.length,
                redirect: this.results.redirect.length
            },
            brokenURLs: this.results.broken,
            timeoutURLs: this.results.timeout,
            redirectURLs: this.results.redirect
        };

        const filename = `broken-urls-report-${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(brokenURLsData, null, 2));
        console.log(`💾 Detailed report saved to: ${filename}`);
        
        return filename;
    }
}

// Execute verification
async function runVerification() {
    const verifier = new URLVerificationSystem();
    await verifier.verifyAllURLs();
}

runVerification().catch(error => {
    console.error('Verification failed:', error);
});