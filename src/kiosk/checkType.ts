/**
 * 출근/점심/퇴근 구분을 현재 시각으로 판단한다.
 * kiosk_server.py의 check_type_for_time()과 반드시 동일한 시간대를 써야 한다 -
 * 실제 저장값은 서버가 이 로직으로 다시 판단해 결정하고 클라이언트 값은
 * 무시하므로, 여기서는 화면에 "지금은 이거예요"를 미리 보여주는 용도일 뿐이다.
 */
export function checkTypeForTime(date = new Date()) {
  const hour = date.getHours()
  if (hour >= 6 && hour < 11) return '출근'
  if (hour >= 11 && hour < 14) return '점심'
  return '퇴근'
}
