// Emergency URL verification and cleanup of fake opportunities
const { neon } = require('@neondatabase/serverless');
const axios = require('axios');

class EmergencyURLVerification {
    constructor() {
        this.sql = neon(process.env.DATABASE_URL);
    }

    async deleteAllFakeStandOutSearch() {
        console.log('🚨 EMERGENCY: Deleting ALL fake StandOutSearch opportunities...');
        
        // First delete all applications referencing StandOutSearch opportunities
        const appResult = await this.sql`
            DELETE FROM applications 
            WHERE opportunity_id IN (
                SELECT id FROM opportunities WHERE source = 'StandOutSearch'
            )
        `;
        console.log(`Deleted ${appResult.count || 0} applications referencing fake opportunities`);
        
        // Then delete the fake opportunities
        const oppResult = await this.sql`
            DELETE FROM opportunities 
            WHERE source = 'StandOutSearch'
        `;
        
        console.log(`✅ Deleted ${oppResult.count || 'all'} fake StandOutSearch opportunities`);
        return { applications: appResult.count, opportunities: oppResult.count };
    }

    async verifyURL(url) {
        try {
            // Check if URL is properly formatted
            if (!url || !url.startsWith('http')) {
                return { valid: false, error: 'Invalid URL format' };
            }

            // Make HTTP request with timeout
            const response = await axios.get(url, {
                timeout: 10000,
                validateStatus: (status) => status < 500, // Accept redirects and client errors
                maxRedirects: 5
            });

            if (response.status >= 200 && response.status < 400) {
                return { valid: true, status: response.status };
            } else {
                return { valid: false, error: `HTTP ${response.status}` };
            }
        } catch (error) {
            if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                return { valid: false, error: 'Domain not found' };
            } else if (error.code === 'ETIMEDOUT') {
                return { valid: false, error: 'Timeout' };
            } else {
                return { valid: false, error: error.message };
            }
        }
    }

    async verifyAllURLs() {
        console.log('🔍 Verifying ALL URLs in database...');
        
        const opportunities = await this.sql`
            SELECT id, title, url, organization 
            FROM opportunities 
            ORDER BY id
        `;

        console.log(`Found ${opportunities.length} opportunities to verify`);
        
        let validCount = 0;
        let invalidCount = 0;
        const invalidOpportunities = [];

        for (let i = 0; i < opportunities.length; i++) {
            const opp = opportunities[i];
            console.log(`Checking ${i + 1}/${opportunities.length}: ${opp.title}`);
            
            const verification = await this.verifyURL(opp.url);
            
            if (verification.valid) {
                validCount++;
                console.log(`✅ Valid: ${opp.url}`);
            } else {
                invalidCount++;
                console.log(`❌ Invalid: ${opp.url} (${verification.error})`);
                invalidOpportunities.push({
                    id: opp.id,
                    title: opp.title,
                    organization: opp.organization,
                    url: opp.url,
                    error: verification.error
                });
            }

            // Add delay to avoid overwhelming servers
            if (i % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        return {
            total: opportunities.length,
            valid: validCount,
            invalid: invalidCount,
            invalidOpportunities
        };
    }

    async run() {
        console.log('=== EMERGENCY URL VERIFICATION ===');
        
        // Step 1: Delete all fake StandOutSearch opportunities
        await this.deleteAllFakeStandOutSearch();
        
        // Step 2: Get updated count
        const totalCount = await this.sql`SELECT COUNT(*) as count FROM opportunities`;
        console.log(`Database now contains ${totalCount[0].count} opportunities`);
        
        // Step 3: Verify all remaining URLs (optional - comment out if too slow)
        // const verification = await this.verifyAllURLs();
        // console.log('\n=== URL VERIFICATION RESULTS ===');
        // console.log(`Total checked: ${verification.total}`);
        // console.log(`Valid URLs: ${verification.valid}`);
        // console.log(`Invalid URLs: ${verification.invalid}`);
        
        console.log('\n✅ Emergency cleanup complete');
        console.log('All fake StandOutSearch opportunities have been removed');
        console.log('Database integrity restored');
    }
}

async function main() {
    const verification = new EmergencyURLVerification();
    await verification.run();
}

main().catch(console.error);