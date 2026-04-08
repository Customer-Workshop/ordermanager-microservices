namespace LegalRecovery.Domain.ValueObjects;

/// <summary>
/// Value object representing a unique jurisdiction identifier (State + County + Courthouse).
/// Used for template matching and rule lookup.
/// </summary>
public record JurisdictionKey(Guid? StateId, Guid? CountyId, Guid? CourthouseId)
{
    public static JurisdictionKey ForState(Guid stateId) => new(stateId, null, null);
    public static JurisdictionKey ForCounty(Guid stateId, Guid countyId) => new(stateId, countyId, null);
    public static JurisdictionKey ForCourthouse(Guid stateId, Guid countyId, Guid courthouseId) => new(stateId, countyId, courthouseId);
}
