type EventName = 
  | 'page_view'
  | 'maintenance_request_created'
  | 'work_order_created'
  | 'property_added'
  | 'contractor_added'
  | 'user_settings_updated';

interface AnalyticsEvent {
  name: EventName;
  properties?: Record<string, unknown>;
  timestamp: number;
}

class Analytics {
  private static instance: Analytics;
  private queue: AnalyticsEvent[] = [];
  private isInitialized = false;
  private flushInterval: number | null = null;

  private constructor() {
    this.initialize();
  }

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  private initialize() {
    if (this.isInitialized) return;
    
    // Set up flush interval (every 30 seconds)
    this.flushInterval = window.setInterval(() => this.flush(), 30000);
    
    // Flush before page unload
    window.addEventListener('beforeunload', () => this.flush());
    
    this.isInitialized = true;
  }

  private async flush() {
    if (this.queue.length === 0) return;

    try {
      // In a real app, you would send this to your analytics service
      // For now, we'll just log it
      const events = [...this.queue];
      this.queue = [];
      
      console.log('Analytics events:', events);
      
      // Here you would typically make an API call to your analytics service
      // await fetch('your-analytics-endpoint', {
      //   method: 'POST',
      //   body: JSON.stringify(events),
      // });
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Put failed events back in the queue
      this.queue.unshift(...this.queue);
    }
  }

  track(name: EventName, properties?: Record<string, unknown>) {
    this.queue.push({
      name,
      properties,
      timestamp: Date.now(),
    });
  }

  pageView(path: string) {
    this.track('page_view', { path });
  }

  cleanup() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

export const analytics = Analytics.getInstance();