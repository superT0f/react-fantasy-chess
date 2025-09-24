export class Cookie {
  static set(name: string, value: string, days: number = 30): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    const cookieValue = encodeURIComponent(value) + (days ? `; expires=${expires.toUTCString()}` : '');
    document.cookie = `${name}=${cookieValue}; path=/; SameSite=Lax` + (location.protocol === 'https:' ? '; Secure' : '');
  }

  static get(name: string): string | null {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    return null;
  }

  static delete(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }

  static setRememberMeToken(token: string): void {
    this.set('remember_me', token, 30); // 30 days expiration
  }

  static getRememberMeToken(): string | null {
    return this.get('remember_me');
  }

  static clearRememberMe(): void {
    this.delete('remember_me');
    this.delete('user_data');
  }

  static setUserData(user: any): void {
    this.set('user_data', JSON.stringify(user), 30);
  }

  static getUserData(): any {
    const userData = this.get('user_data');
    return userData ? JSON.parse(userData) : null;
  }
}