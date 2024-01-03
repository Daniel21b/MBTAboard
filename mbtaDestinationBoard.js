class MBTADestinationBoard {
  constructor(apiBase, stopId) {
    this.apiBase = apiBase;
    this.stopId = stopId;
    this.interval = null;
    this.pollingFrequency = 30000; // Poll every 30 seconds
  }

  // Method to start polling
  startPolling() {
    this.fetchSchedule();
    this.interval = setInterval(() => this.fetchSchedule(), this.pollingFrequency);
  }

  // Method to stop polling
  stopPolling() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  // Asynchronous method to fetch schedule
  async fetchSchedule() {
    const endpoint = `${this.apiBase}/predictions?filter[stop]=${this.stopId}&include=schedule,trip`;
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.updateUI(data);
    } catch (error) {
      console.error('Failed to fetch MBTA data:', error);
      // Handle error (e.g., show error message to the user)
    }
  }

  // Method to update the UI with new data
  updateUI(data) {
    const boardContent = document.getElementById('board-content');
    boardContent.innerHTML = this.formatScheduleData(data);
  }

  // Helper method to format the schedule data for the UI
  formatScheduleData(apiResponse) {
    const predictions = apiResponse.data;
    return predictions.map(prediction => {
      const attributes = prediction.attributes;
      const arrivalTime = attributes.arrival_time ? new Date(attributes.arrival_time).toLocaleTimeString() : 'N/A';
      const departureTime = attributes.departure_time ? new Date(attributes.departure_time).toLocaleTimeString() : 'N/A';
      const status = attributes.status || 'Unknown'; 
      const trainNo = prediction.relationships.vehicle.data ? prediction.relationships.vehicle.data.id : 'N/A';
      const trackNo = attributes.track || 'TBD'; // Assuming 'track' is the correct attribute

      return `
        <tr>
          <td>${arrivalTime !== 'N/A' ? arrivalTime : departureTime}</td>
          <td>${attributes.headsign}</td> <!-- assuming headsign is the correct attribute for destination -->
          <td>${trainNo}</td>
          <td>${trackNo}</td>
          <td>${status}</td>
        </tr>
      `;
    }).join(''); // Join the array of strings into a single string
  }
}

// Usage:
document.addEventListener('DOMContentLoaded', function() {
  const apiBase = 'https://api-v3.mbta.com';
  const stopId = 'place-north'; // Replace with your specific stop ID
  const mbtaBoard = new MBTADestinationBoard(apiBase, stopId);
  mbtaBoard.startPolling();
});
