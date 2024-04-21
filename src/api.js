const leaderHost = "https://wedev-api.sky.pro/api/v2/leaderboard";

export function getAllLeaders() {
  return fetch(leaderHost, {
    method: "GET",
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Произошла ошибка сервера, попробуйте позже");
      }
      return response.json();
    })
    .catch(error => {
      console.error("Ошибка при получении данных лидерборда:", error);
      throw error;
    });
}

export function postLeader({ name, time, achievements }) {
  return fetch(leaderHost, {
    method: "POST",
    body: JSON.stringify({
      name,
      time,
      achievements,
    }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Произошла ошибка сервера, попробуйте позже");
      }
      return response.json();
    })
    .catch(error => {
      console.error("Ошибка при получении данных лидерборда:", error);
      // throw error;
    });
}
