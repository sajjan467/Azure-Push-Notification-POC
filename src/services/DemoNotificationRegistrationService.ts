// src/services/DemoNotificationRegistrationService.ts
export default class DemoNotificationRegistrationService {
  constructor(readonly apiUrl: string, readonly apiKey: string) {}

  async registerAsync(request: any): Promise<Response> {
    const url = `${this.apiUrl}/notifications/installations`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        apiKey: this.apiKey,
      },
      body: JSON.stringify(request),
    });

    console.log(response, 'response--');
    this.validateResponse(url, 'PUT', request, response);
    return response;
  }

  async deregisterAsync(deviceId: string): Promise<Response> {
    const url = `${this.apiUrl}/notifications/installations/${deviceId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        apiKey: this.apiKey,
      },
    });
    this.validateResponse(url, 'DELETE', null, response);
    return response;
  }

  private validateResponse(
    url: string,
    method: string,
    request: any,
    response: Response,
  ) {
    console.log(`Request: ${method} ${url} => ${JSON.stringify(request)}`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
  }
}
