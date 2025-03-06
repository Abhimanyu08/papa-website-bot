import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();
export class NetlifyService {
	constructor() {
		this.siteId = process.env.NETLIFY_SITE_ID;
		this.accessToken = process.env.NETLIFY_ACCESS_TOKEN;
		this.baseUrl = "https://api.netlify.com/api/v1";
	}

	async waitForDeployment(maxAttempts = 30, interval = 2000) {
		// 30 attempts, 2 sec each
		try {
			for (let attempt = 0; attempt < maxAttempts; attempt++) {
				const deploy = await this.getLatestDeploy();

				if (deploy.state === "ready") {
					// Calculate the URL for the new essay
					// Assuming your site structure is like: site.com/essays/YYYY-MM-DD-title
					return {
						status: "success",
					};
				}

				if (deploy.state === "error") {
					return {
						status: "error",
						message: "Deployment failed",
					};
				}

				// Wait before checking again
				await new Promise((resolve) => setTimeout(resolve, interval));
			}

			return {
				status: "timeout",
				message: "Deployment taking longer than expected",
			};
		} catch (error) {
			return {
				status: "error",
				message: "Error checking deployment status",
			};
		}
	}

	async getLatestDeploy() {
		const response = await fetch(
			`${this.baseUrl}/sites/${this.siteId}/deploys`,
			{
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
				},
			}
		);

		if (!response.ok) {
			console.error(response.statusText);
			throw new Error(`Netlify API error: ${response.statusText}`);
		}
		const deploys = await response.json();

		return deploys[0];
	}
}
